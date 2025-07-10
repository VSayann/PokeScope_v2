console.log("🔍 Test de l'API /api/pokemon...");

import "dotenv/config";
import express from "express";
import { registerRoutes } from "../server/routes";
import request from "supertest";

async function testApi() {
  const app = express();
  await registerRoutes(app);

  try {
    const res = await request(app).get("/api/pokemon");
    if (res.status === 200) {
      console.log("✅ Test réussi : statut 200 et corps reçu (", res.body.count ?? "?", "items)");
      process.exit(0);
    } else {
      console.error("❌ Échec du test : statut", res.status);
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Erreur lors de l'appel à l'API :", err);
    process.exit(1);
  }
}

testApi();
