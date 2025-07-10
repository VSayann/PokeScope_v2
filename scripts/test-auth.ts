console.log("🔍 Test d'authentification (register + login + session)");

import "dotenv/config";
import express from "express";
import request from "supertest";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "../server/routes";
import { pool } from "../server/db";

const PgSession = connectPgSimple(session);

const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  username: `testuser-${Date.now()}`,
  password: "Test123!"
};

async function cleanup() {
  await pool.query("DELETE FROM users WHERE email = $1", [TEST_USER.email]);
  console.log("🧹 Nettoyage du compte de test terminé");
}

async function testAuth() {
  const app = express();
  app.use(express.json());
  
  // Configuration de la session pour les tests
  app.use(session({
    secret: "test-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: new PgSession({ 
      pool,
      createTableIfMissing: true 
    })
  }));

  await registerRoutes(app);

  console.log("1. Test d'inscription...");
  const registerRes = await request(app)
    .post("/api/auth/register")
    .send({
      email: TEST_USER.email,
      username: TEST_USER.username,
      password: TEST_USER.password
    });

  if (registerRes.status !== 200) {
    console.error("❌ Échec de l'inscription :", registerRes.body);
    process.exit(1);
  }
  console.log("✅ Inscription réussie");

  console.log("\n2. Test de connexion...");
  const agent = request.agent(app);
  const loginRes = await agent
    .post("/api/auth/login")
    .send({
      identifier: TEST_USER.email,
      password: TEST_USER.password
    });

  if (loginRes.status !== 200) {
    console.error("❌ Échec de la connexion :", loginRes.body);
    await cleanup();
    process.exit(1);
  }
  console.log("✅ Connexion réussie");

  console.log("\n3. Vérification de la session...");
  const userRes = await agent.get("/api/auth/user");
  
  if (userRes.status !== 200) {
    console.error("❌ Échec de la récupération du profil :", userRes.body);
    await cleanup();
    process.exit(1);
  }
  
  console.log("✅ Session valide, utilisateur récupéré :", {
    id: userRes.body.id,
    username: userRes.body.username
  });

  await cleanup();
  console.log("\n✅ Tous les tests d'authentification ont réussi !");
  process.exit(0);
}

testAuth().catch(async (err) => {
  console.error("❌ Erreur inattendue :", err);
  await cleanup();
  process.exit(1);
});
