import { drizzle } from "drizzle-orm/node-postgres"
import { Client } from "pg";

if(!process.env.DATABASE_URL) {
  throw new Error('Database url not provided')
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const connectClient = async () => {
  await client.connect();
}

connectClient();
export const db = drizzle(client);