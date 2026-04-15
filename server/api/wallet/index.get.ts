import { connectDb } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  console.log("WALLET GET ROUTE HIT")
  const auth0 = useAuth0(event);
  
  const session = await auth0.getSession();
  
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
  }
  
  // We want to get wallet address for user and perhaps balance
  try {
    const database = await connectDb();
    
    const [user] = await database
      .select({
        agenticWalletAddress: users.agenticWalletAddress,
        balanceOkb: users.balanceOkb,
      })
      .from(users)
      .where(eq(users.auth0Id, session?.user?.sub))
      .limit(1)
    
    if (!user) {
      console.log("No user exists")
      throw createError({ statusCode: 404, statusMessage: "User not found" })
    }
    console.log(user)
    
    console.log("WALLET GET ROUTE FINISHED")
    
    return {
      agenticWalletAddress: user?.agenticWalletAddress,
      balanceOkb: user?.balanceOkb
    }
  } catch (error) {
    console.error("An error occurred: ", error);
    throw createError({ statusCode: 500, statusMessage: "An error occurred, check server logs" })
  }
})