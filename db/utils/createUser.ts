import { connectDb } from '../index'
import * as schema from '../schema'
import { eq } from 'drizzle-orm'
import { users } from "../schema";

export async function createUser(
  auth0Id: string,
  userData: {
    email: string,
    name?: string,
    picture?: string,
  },
) {
  const database = await connectDb();
  console.log("Adding user to database")
  try {
    const [existingUser] = await database
      .select()
      .from(users)
      .where(eq(users.auth0Id, auth0Id))
      .limit(1)
    
    if (existingUser) {
      console.log("User exists")
      event.context.user = existingUser
      return
    }
    
    const [created_user] = await database.insert(users).values({
      auth0Id,
      email: userData.email,
      name: userData.name || null,
      picture: userData.picture || null
    }).returning()
    console.log("User has been created")
    return created_user
  } catch (error) {
    console.log("An error occurred: ", error)
  }
  
}