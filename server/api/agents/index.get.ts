import { agents } from "../../../db/schema";
import { connectDb } from "../../../db";
import { eq } from "drizzle-orm";


export default defineEventHandler(async (event) => {
  const auth0 = useAuth0(event);
  const session = await auth0.getSession();
  
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
  
  const database = await connectDb();
  
  const user = await database.query.users.findFirst({
    where: (users, { eq }) => eq(users.auth0Id, session.user.sub)
  })
  if (!user) throw createError({ statusCode: 404, statusMessage: "User not found" })
  
  const result = await database.query.agents.findMany({
    where: eq(agents.userId, user.id),
    orderBy: (agents, { asc }) => asc(agents.createdAt)
  })
  
  return result
})