import type { Express } from "express";
import { createServer, type Server } from "http";
import { isAuthenticated, login, register } from "./auth";
import { getUser, getFavorites, addFavorite, removeFavorite } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/login", login);
  app.post("/api/auth/register", register);

  app.put("/api/auth/profile", isAuthenticated, async (req: any, res) => {
    const { updateProfile } = await import("./auth");
    return updateProfile(req, res);
  });

  app.post("/api/auth/logout", async (req: any, res) => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Déconnecté avec succès" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const user = await getUser((req.session as any).userId);
      res.json(user);
    } catch {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    }
  });

  app.get("/api/favorites", isAuthenticated, async (req: any, res) => {
    const favs = await getFavorites((req.session as any).userId);
    res.json(favs);
  });

  app.post("/api/favorites/:id", isAuthenticated, async (req: any, res) => {
    const pokemonId = parseInt(req.params.id);
    await addFavorite((req.session as any).userId, pokemonId);
    res.status(201).json({ message: "Ajouté avec succès" });
  });

  app.delete("/api/favorites/:id", isAuthenticated, async (req: any, res) => {
    const pokemonId = parseInt(req.params.id);
    await removeFavorite((req.session as any).userId, pokemonId);
    res.status(200).json({ message: "Supprimé avec succès" });
  });

  const { listPokemons, getPokemon, searchPokemon, listAllPokemons } = await import("./pokemon");
  app.get("/api/pokemon/all", listAllPokemons);
  app.get("/api/pokemon", listPokemons);
  app.get("/api/pokemon/search/:query", searchPokemon);
  app.get("/api/pokemon/:id", getPokemon);

  return createServer(app);
}
