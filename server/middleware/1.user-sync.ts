import { createUser } from "../../db/utils/createUser"


export default defineEventHandler(async (event) => {
  console.log("USER SYNC MIDDLEWARE HIT")
  if (event.path === '/' || event.path === '') return
  if (!event.path.startsWith('/api') || event.path.includes('/api/auth')) return
  
  const auth0 = useAuth0(event);
  const session = await auth0.getSession();
  if (!session?.user?.sub) return

  try {
    console.log("SAVING USER")
    const user = await createUser(session.user.sub, {
      email: session?.user?.email,
      name: session.user.name,
      picture: session.user.picture
    })
    
    
    console.log("USER SYNC MIDDLEWARE FINISHED")
    
  } catch (error) {
    console.error('[UserSync] Failed:', error)
  }
})