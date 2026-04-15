// server/api/agenticwallet.get.ts
import { users, agents, tasks, transactions } from "../../../db/schema";
import { connectDb } from "../../../db";
import { eq, and, sql, inArray } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  console.log("HOME ROUTE GET HIT")
  const auth0 = useAuth0(event);
  const session = await auth0.getSession();

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const db = await connectDb();

  // Get user + all stats in one go
  const result = await db
    .select({
      // User wallet info
      agenticWalletAddress: users.agenticWalletAddress,
      balanceOkb: users.balanceOkb,

      // Stats
      agentsCount: sql<number>`count(distinct ${agents.id})`,
      tasksCount: sql<number>`count(distinct ${tasks.id})`,
      transactionsCount: sql<number>`count(distinct ${transactions.id})`,

      // Total spent (only outgoing transactions)
      totalSpentOkb: sql<number>`
        COALESCE(
          SUM(
            CASE 
              WHEN ${transactions.type} IN ('payment', 'allocation', 'withdrawal')
              THEN ${transactions.amountOkb}
              ELSE 0 
            END
          ), 
          0
        )
      `,
    })
    .from(users)
    .leftJoin(agents, eq(agents.userId, users.id))
    .leftJoin(tasks, eq(tasks.userId, users.id))
    .leftJoin(transactions, eq(transactions.userId, users.id))
    .where(eq(users.auth0Id, session.user.sub))
    .groupBy(users.id, users.agenticWalletAddress, users.balanceOkb);

  const user = result[0];

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  
  console.log("HOME ROUTE GET FINISHED")
  
  return {
    hasAgenticWallet: !!user.agenticWalletAddress,
    evmAddress: user.agenticWalletAddress || null,
    balanceOkb: Number(user.balanceOkb) || 0,

    // Dashboard stats
    agentsCount: Number(user.agentsCount) || 0,
    tasksCount: Number(user.tasksCount) || 0,
    transactionsCount: Number(user.transactionsCount) || 0,
    totalSpentOkb: Number(user.totalSpentOkb) || 0,
  };
});