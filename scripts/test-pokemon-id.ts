console.log("🔍 Test de l'API Pokémon par ID");

import "dotenv/config";
import express from "express";
import { registerRoutes } from "../server/routes";
import request from "supertest";

async function testPokemonById() {
  const app = express();
  await registerRoutes(app);

  const PIKACHU_ID = 25;
  console.log(`1. Requête GET /api/pokemon/${PIKACHU_ID}...`);
  
  const res = await request(app).get(`/api/pokemon/${PIKACHU_ID}`);
  
  if (res.status !== 200) {
    console.error(`❌ Erreur ${res.status} :`, res.body);
    process.exit(1);
  }

  const pokemon = res.body;
  if (pokemon.name !== "pikachu") {
    console.error(`❌ Nom invalide. Attendu: "pikachu", Reçu: "${pokemon.name}"`);
    process.exit(1);
  }

  if (!Array.isArray(pokemon.stats) || pokemon.stats.length === 0) {
    console.error("❌ Aucune statistique trouvée");
    process.exit(1);
  }

  if (!Array.isArray(pokemon.types) || pokemon.types.length === 0) {
    console.error("❌ Aucun type trouvé");
    process.exit(1);
  }

  console.log("✅ Données du Pokémon récupérées avec succès :", {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types.map((t: any) => t.type.name),
    stats: pokemon.stats.map((s: any) => ({
      name: s.stat.name,
      value: s.base_stat
    }))
  });

  console.log("\n✅ Test réussi !");
  process.exit(0);
}

testPokemonById().catch((err) => {
  console.error("❌ Erreur inattendue :", err);
  process.exit(1);
});
