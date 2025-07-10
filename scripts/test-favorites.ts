console.log("🔍 Test des favoris (ajout/suppression)");

import "dotenv/config";
import express from "express";
import request from "supertest";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "../server/routes";
import { pool } from "../server/db";

const PgSession = connectPgSimple(session);

const TEST_USER = {
  email: `test-fav-${Date.now()}@example.com`,
  username: `testuser-fav-${Date.now()}`,
  password: "Test123!"
};

let userId: string;
let agent: request.SuperTest<request.Test>;

async function cleanup() {
  if (userId) {
    await pool.query("DELETE FROM favorites WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  }
  console.log("🧹 Nettoyage terminé");
}

async function createTestUser() {
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

  // Créer un nouvel agent pour ce test
  const testAgent = request.agent(app);

  // 1. Création du compte
  console.log("Création du compte de test...");
  const registerRes = await testAgent
    .post("/api/auth/register")
    .send(TEST_USER);

  if (registerRes.status !== 200) {
    throw new Error(`Échec de la création du compte : ${JSON.stringify(registerRes.body)}`);
  }

  // 2. Connexion
  console.log("Connexion...");
  const loginRes = await testAgent
    .post("/api/auth/login")
    .send({
      identifier: TEST_USER.email,
      password: TEST_USER.password
    });

  if (loginRes.status !== 200) {
    throw new Error(`Échec de la connexion : ${JSON.stringify(loginRes.body)}`);
  }

  userId = loginRes.body.id;
  console.log(`Utilisateur connecté avec l'ID: ${userId}`);
  return testAgent;
}

async function testFavorites() {
  const agent = await createTestUser();
  const POKEMON_ID = 25;

  console.log("1. Ajout d'un favori...");
  const addRes = await agent
    .post(`/api/favorites/${POKEMON_ID}`);

  if (addRes.status !== 201) {
    throw new Error(`Échec de l'ajout du favori : ${JSON.stringify(addRes.body)}`);
  }
  console.log("✅ Favori ajouté");

  console.log("\n2. Vérification de la liste...");
  const listRes = await agent.get("/api/favorites");
  
  if (listRes.status !== 200 || !Array.isArray(listRes.body)) {
    throw new Error("Format de réponse invalide pour /api/favorites");
  }

  const hasPokemon = listRes.body.some((fav: any) => fav.pokemonId === POKEMON_ID);
  if (!hasPokemon) {
    throw new Error("Le Pokémon n'a pas été trouvé dans les favoris");
  }
  console.log("✅ Favori trouvé dans la liste");

  console.log("\n3. Suppression du favori...");
  const deleteRes = await agent.delete(`/api/favorites/${POKEMON_ID}`);
  
  if (deleteRes.status !== 200) {
    throw new Error(`Échec de la suppression : ${JSON.stringify(deleteRes.body)}`);
  }

  const checkRes = await agent.get("/api/favorites");
  const stillExists = checkRes.body.some((fav: any) => fav.pokemonId === POKEMON_ID);
  
  if (stillExists) {
    throw new Error("Le favori n'a pas été supprimé");
  }
  console.log("✅ Favori supprimé avec succès");

  console.log("\n✅ Tous les tests des favoris ont réussi !");
}

testFavorites()
  .then(() => cleanup())
  .catch(async (err) => {
    console.error("❌ Erreur :", err.message);
    await cleanup();
    process.exit(1);
  });
