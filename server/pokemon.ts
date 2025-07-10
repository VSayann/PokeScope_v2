import type { Request, Response } from "express";

const POKE_API_BASE = "https://pokeapi.co/api/v2";

export async function listPokemons(req: Request, res: Response) {
  try {
    const limit = parseInt((req.query.limit as string) ?? "20", 10);
    const offset = parseInt((req.query.offset as string) ?? "0", 10);
    const url = `${POKE_API_BASE}/pokemon?limit=${limit}&offset=${offset}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des pokémons" });
  }
}

async function getFrenchName(id: number): Promise<string | undefined> {
  const res = await fetch(`${POKE_API_BASE}/pokemon-species/${id}`);
  if (!res.ok) return undefined;
  const data = await res.json();
  const fr = data.names?.find((n: any) => n.language.name === "fr");
  return fr?.name;
}

// Cache pour stocker les noms français déjà récupérés
const frenchNamesCache = new Map<number, string>();

async function getFrenchNameWithCache(id: number): Promise<string> {
  if (frenchNamesCache.has(id)) {
    return frenchNamesCache.get(id)!;
  }
  
  try {
    const res = await fetch(`${POKE_API_BASE}/pokemon-species/${id}`);
    if (!res.ok) return '';
    
    const data = await res.json();
    const frName = data.names?.find((n: any) => n.language.name === "fr")?.name;
    
    if (frName) {
      frenchNamesCache.set(id, frName);
      return frName;
    }
    return '';
  } catch (error) {
    console.error(`Erreur lors de la récupération du nom français pour le Pokémon ${id}:`, error);
    return '';
  }
}

export async function listAllPokemons(req: Request, res: Response) {
  try {
    // Récupérer le nombre total de Pokémon (environ 1300)
    const countRes = await fetch(`${POKE_API_BASE}/pokemon?limit=1`);
    const countData = await countRes.json();
    const total = countData.count;

    // Récupérer tous les Pokémon en une seule requête
    const allRes = await fetch(`${POKE_API_BASE}/pokemon?limit=${total}`);
    const allData = await allRes.json();

    // Préparer les requêtes pour les noms français en parallèle
    const pokemonPromises = allData.results.map(async (p: any) => {
      const id = parseInt(p.url.split("/").filter(Boolean).pop(), 10);
      const frName = await getFrenchNameWithCache(id);
      return { 
        id, 
        name: p.name, 
        name_fr: frName || p.name, // Utiliser le nom anglais si pas de traduction
        url: p.url 
      };
    });

    // Attendre que toutes les requêtes soient terminées
    const results = await Promise.all(pokemonPromises);
    
    // Trier par ID pour avoir un ordre cohérent
    results.sort((a, b) => a.id - b.id);
    
    res.json({ 
      count: results.length, 
      results 
    });
  } catch (err) {
    console.error("Erreur lors de la récupération complète :", err);
    res.status(500).json({ 
      message: "Erreur lors de la récupération complète",
      error: err instanceof Error ? err.message : 'Erreur inconnue'
    });
  }
}

export async function getPokemon(req: Request, res: Response) {
  try {
    const idOrName = req.params.id;
    const response = await fetch(`${POKE_API_BASE}/pokemon/${idOrName}`);
    if (!response.ok) return res.status(404).json({ message: "Pokémon introuvable" });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération du pokémon" });
  }
}

export async function searchPokemon(req: Request, res: Response) {
  try {
    const query = req.params.query?.toLowerCase();
    if (!query) return res.status(400).json({ message: "Query manquante" });

    // Récupérer tous les Pokémon
    const countRes = await fetch(`${POKE_API_BASE}/pokemon?limit=1`);
    const countData = await countRes.json();
    const total = countData.count;
    const allRes = await fetch(`${POKE_API_BASE}/pokemon?limit=${total}`);
    const allData = await allRes.json();

    // Filtrer les résultats localement (recherche insensible à la casse)
    const filtered = allData.results.filter((p: any) => {
      const name = p.name.toLowerCase();
      return name.includes(query);
    });

    // Enrichir avec les noms français
    const enriched = await Promise.all(
      filtered.map(async (p: any) => {
        const id = parseInt(p.url.split("/").filter(Boolean).pop(), 10);
        const frName = await getFrenchNameWithCache(id);
        return { 
          id, 
          name: p.name, 
          name_fr: frName || p.name, // Utiliser le nom anglais si pas de traduction
          url: p.url 
        };
      })
    );

    // Trier par ID pour avoir un ordre cohérent
    enriched.sort((a, b) => a.id - b.id);

    res.json(enriched);
  } catch (err) {
    console.error("Erreur lors de la recherche :", err);
    res.status(500).json({ 
      message: "Erreur lors de la recherche",
      error: err instanceof Error ? err.message : 'Erreur inconnue'
    });
  }
}
