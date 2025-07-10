console.log("🔍 Test de connexion à la base PostgreSQL...");

import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Connexion réussie :", res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur de connexion :", err);
    process.exit(1);
  }
}

testConnection();
