// This is the backend for checking the user database for an agentic wallet address that belongs to the user.
import { connectDb } from "../../../db";
import { eq } from "drizzle-orm";
import { users } from "../../../db/schema";

export default defineEventHandler(async (event) => {
  console.log("HIT AGENTICWALLET GET ROUTE")
  const auth0 = useAuth0(event);
  
  const session = await auth0.getSession();
  console.log(session.user)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
   // Now we want to call the database and check if agentic wallet is filled
   
  const database = await connectDb();
  
  const userExists = await database
    .select()
    .from(users)
    .where(eq(users.auth0Id, session?.user?.sub))
  
  console.log(userExists)
  console.log("AGENTICWALLET GET FINISHED")
  return {
    hasAgenticWallet: !!userExists?.agenticWalletAddress,
    evmAddress: userExists?.agenticWalletAddress ?? null,
  }
  
})