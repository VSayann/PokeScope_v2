console.log("🔍 Test de recherche de Pokémon");

import "dotenv/config";
import express from "express";
import { registerRoutes } from "../server/routes";
import request from "supertest";

async function testSearch() {
  const app = express();
  await registerRoutes(app);

  const SEARCH_QUERY = "pika";
  console.log(`1. Recherche de Pokémon avec "${SEARCH_QUERY}"...`);
  
  const res = await request(app).get(`/api/pokemon/search/${SEARCH_QUERY}`);
  
  if (res.status !== 200) {
    console.error(`❌ Erreur ${res.status} :`, res.body);
    process.exit(1);
  }

  if (!Array.isArray(res.body)) {
    console.error("❌ Format de réponse invalide, tableau attendu");
    process.exit(1);
  }

  if (res.body.length === 0) {
    console.error("❌ Aucun résultat trouvé");
    process.exit(1);
  }

  const hasPikachu = res.body.some((p: any) => 
    p.name.includes(SEARCH_QUERY) || 
    (p.name_fr && p.name_fr.toLowerCase().includes(SEARCH_QUERY))
  );

  if (!hasPikachu) {
    console.error(`❌ Aucun Pokémon avec "${SEARCH_QUERY}" dans le nom`);
    process.exit(1);
  }

  console.log("✅ Résultats de recherche :", 
    res.body.map((p: any) => ({
      id: p.id,
      name: p.name,
      name_fr: p.name_fr || 'N/A'
    }))
  );

  console.log("\n✅ Test de recherche réussi !");
  process.exit(0);
}

testSearch().catch((err) => {
  console.error("❌ Erreur inattendue :", err);
  process.exit(1);
});
