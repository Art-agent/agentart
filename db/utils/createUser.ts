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
    const user_exists = database.query.users.findFirst({
      where: (eq(users.auth0Id, auth0Id))
    });
    
    if (user_exists) return user_exists
    
    const [created_user] = database.insert(users).values({
      auth0Id,
      email: userData.email,
      name: userData.name || null,
      picture: userData.picture || null
    }).returning() 
    console.log("Created user is: ", created_user)
    return created_user
  } catch (error) {
    console.log("An error occurred: ", error)
  }
  
}