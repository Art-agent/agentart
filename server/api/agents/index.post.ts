import { z } from "zod";
import { users, agents } from "../../../db/schema";
import { eq, max } from "drizzle-orm";
import { connectDb } from "../../../db";


export default defineEventHandler(async (event) => {
  const createAgentSchema = z.object({
    name: z.string().min(1).max(50),
    roles: z.array(z.enum(['researcher', 'comparator', 'purchaser'])).min(1),
    budgetAllocated: z.number().min(0.01),
  })
  const auth0 = useAuth0(event);
  
  const session = await auth0.getSession();
  if (!session?.user?.sub) {
    throw createError({ statusCode: 401, statusMessage: "You are not authorized" })
  }
  
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" })
  }
  
  //Validate the input of user
  const body = await readBody(event);
  const parsed = createAgentSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: "Invalid input", data: parsed.error })
  }
  
  const { name, roles, budgetAllocated } = parsed.data;
  
  const database = await connectDb();
  
  const userExists = database.query.users.findFirst({
    where:(eq(users.auth0Id, session?.user?.sub))
  })
  
  if (!userExists) {
    throw createError({ statusCode: 404, statusMessage: "User not found" })
  }
  
  if (budgetAllocated > (userExists.balanceOkb ?? 0)) {
    throw createError({ statusCode: 400, statusMessage: "Insufficient balance" })
  }
  
  // Derive next sub-wallet index
    const result = database
      .select({ maxIndex: max(agents.subWalletIndex) })
      .from(agents)
      .where(eq(agents.userId, user.id))
  
  const nextIndex = (result[0]?.maxIndex ?? -1) + 1
  
  if (nextIndex > 50) {
    throw createError({ statusCode: 400, statusMessage: "Maximum number of agents (50) reached" })
  }
  
  const [createAgent] = database.insert(agents).values({
    name,
    roles,
    status: "idle",
    subWalletIndex: nextIndex,
    subWalletAddress: null, // We will have to tell t=user to generate this
    budgetAllocated,
    budgetRemaining: budgetAllocated,
    lastAction: null,
    txCount: 0
  }).returning()
  
})