import { pool } from "./db";

export async function getUser(userId: string) {
  const result = await pool.query("SELECT id, email, username, profile_image_url FROM users WHERE id = $1", [userId]);
  const user = result.rows[0];
  if (!user) throw new Error("Utilisateur introuvable");
  return user;
}

export async function getFavorites(userId: string) {
  const result = await pool.query("SELECT pokemon_id AS \"pokemonId\" FROM favorites WHERE user_id = $1", [userId]);
  return result.rows;
}

export async function addFavorite(userId: string, pokemonId: number) {
  await pool.query(
    "INSERT INTO favorites (user_id, pokemon_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [userId, pokemonId]
  );
}

export async function removeFavorite(userId: string, pokemonId: number) {
  await pool.query(
    "DELETE FROM favorites WHERE user_id = $1 AND pokemon_id = $2",
    [userId, pokemonId]
  );
}
