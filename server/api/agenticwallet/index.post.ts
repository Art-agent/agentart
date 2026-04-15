import { z } from "zod";
import { connectDb } from "../../../db";
import { eq } from "drizzle-orm";
import { users } from "../../../db/schema";

export default defineEventHandler(async (event) => {
  console.log("ROUTE AGENTICWALLET POST HIT")
  const walletAddressSchema = z.object({
    evmAddress: z.string()
  })
  const auth0 = useAuth0(event);
  const session = await auth0.getSession();
  if (!session?.user?.sub) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
  }
  
  console.log("TRYING TO SAVE WALLET")
  
  // Next we want to get the body from the frontend and add the wallet to the db
  const body = await readBody(event);
  const parsed = walletAddressSchema.safeParse(body);
  console.log("parsed: ", parsed)
  if (!parsed.success) {
    console.log("Parsed error occurred")
    throw createError({ statusCode: 400, statusMessage: "Invalid input", data: parsed.error })
  }
  
  const { evmAddress } = parsed.data;
  console.log("EVM Address is: ", evmAddress)
  
  
  try {
    const database = await connectDb();
    const [addWallet] = await database.update(users)
      .set({ agenticWalletAddress: evmAddress })
      .where(eq(users.auth0Id, session?.user?.sub))
      .returning({ id: users.id, agenticWalletAddress: users.agenticWalletAddress })
    console.log("wallet address is: ", addWallet)
  } catch (error) {
    console.log("An error occurred: ", error)
    throw createError({ statusCode: 400, statusMessage: "An error occurred" })
  }
  
  console.log("ROUTE AGENTICWALLET POST FINISHED")
  
  return {
    ok: true,
    wallet: evmAddress
  }
  
  
})