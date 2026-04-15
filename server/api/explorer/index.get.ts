import { users, agents, transactions } from "../../../db/schema";
import { connectDb } from "../../../db";
import { eq, desc, sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const auth0 = useAuth0(event);
  const session = await auth0.getSession();

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const db = await connectDb();

  const user = await db.query.users.findFirst({
    where: eq(users.auth0Id, session.user.sub),
    columns: { id: true },
  });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const txs = await db
    .select({
      id: transactions.id,
      txHash: transactions.txHash,
      type: transactions.type,
      amountOkb: transactions.amountOkb,
      chain: transactions.chain,
      createdAt: transactions.createdAt,
      agentId: agents.id,
      agentName: agents.name,
    })
    .from(transactions)
    .leftJoin(agents, eq(agents.id, transactions.agentId))
    .where(eq(transactions.userId, user.id))
    .orderBy(desc(transactions.createdAt));

  return txs.map((tx) => ({
    hash: tx.txHash ? tx.txHash.slice(0, 10) + "..." : "—",
    fullHash: tx.txHash || "",
    agent: tx.agentName || null,
    type: tx.type,
    amount: tx.amountOkb > 0 
      ? `+${tx.amountOkb.toFixed(2)}` 
      : `-${Math.abs(tx.amountOkb).toFixed(2)}`,
    time: formatRelativeTime(tx.createdAt),   // we'll add this helper
    block: "—",                               // optional: add blockNumber to schema later
    status: "confirmed",
  }));
});

// Simple relative time helper
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
}