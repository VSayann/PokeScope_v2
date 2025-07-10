import type { Request, Response, NextFunction } from "express";

import bcrypt from "bcryptjs";
import { pool } from "./db";

export interface AuthenticatedRequest extends Request {
  session: any;
}

export async function login(req: Request, res: Response) {
  const { identifier, password } = req.body as { identifier: string; password: string };

  const result = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $1", [identifier]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: "Identifiants invalides" });
  }
  (req.session as any).userId = user.id;
  res.json({ id: user.id, email: user.email, username: user.username });
}

export async function register(req: Request, res: Response) {
  const { email, password, username } = req.body as {
    email: string;
    password: string;
    username: string;
  };

  if (!username || username.length < 2) {
    return res.status(400).json({ message: "Pseudo invalide" });
  }

  const exists = await pool.query(
    "SELECT 1 FROM users WHERE email = $1 OR username = $2",
    [email, username]
  );
  if (exists.rowCount && exists.rowCount > 0) {
    return res.status(409).json({ message: "Email ou pseudo déjà utilisé" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username",
    [username, email, passwordHash]
  );
  const user = result.rows[0];
  (req.session as any).userId = user.id;
  res.json(user);
}


export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  const { username, profileImageUrl } = req.body as {
    username?: string;
    profileImageUrl?: string;
  };
  const userId = (req.session as any).userId;
  if (!userId) return res.status(401).json({ message: "Non autorisé" });

  try {
    const result = await pool.query(
      "UPDATE users SET username = COALESCE($1, username), profile_image_url = COALESCE($2, profile_image_url) WHERE id = $3 RETURNING id, email, username, profile_image_url",
      [username ?? null, profileImageUrl ?? null, userId]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Pseudo déjà utilisé" });
    }
    res.status(500).json({ message: "Erreur serveur" });
  }
}

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!((req as any).session)?.userId) {
    return res.status(401).json({ message: "Non autorisé" });
  }
  next();
}
