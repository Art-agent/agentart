import { createUser } from "../../db/utils/createUser"


export default defineEventHandler(async (event) => {
  console.log("USER SYNC MIDDLEWARE HIT")
  const auth0 = useAuth0(event);
  
  if (!event.path.startsWith('/api') || event.path.includes('/api/auth')) return
  
  const session = await auth0.getSession();
  if (!session?.user?.sub) return

  try {
    const user = await createUser(session.user.sub, {
      email: session?.user?.email,
      name: session.user.name,
      picture: session.user.picture
    })
    
    // Attach to context for downstream middleware
    event.context.user = user
    
    console.log("USER SYNC MIDDLEWARE FINISHED")
    
  } catch (error) {
    console.error('[UserSync] Failed:', error)
  }
})