import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;


if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in your .env file.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
