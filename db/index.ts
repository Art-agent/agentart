import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from "./schema";

let db: ReturnType<typeof drizzle>;

export function connectDb() { 
  const config = useRuntimeConfig();
  if (!db) {
    db = drizzle(config.databaseUrl, { schema });
  }
  return db
}

