import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
// import { type NeonHttpDatabase } from 'drizzle-orm/neon-http';

let db: ReturnType<typeof drizzle>;

export function connectDb() { 
  if (!db) {
    const config = useRuntimeConfig();
    db = drizzle(config.databaseUrl);
  }
  return db
}

