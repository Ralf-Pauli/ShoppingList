import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../services/Database";
import argon2 from 'argon2';
import { validationResult } from 'express-validator';
import logger from "../helpers/Logger";

export const maxAge = 3600000; // 1 hour in ms

const checkExistingUserQuery = "SELECT * FROM users WHERE email = \$1";
const insertUserQuery = "INSERT INTO users (email, password) VALUES (\$1, \$2) RETURNING *";
export const getUserByEmailQuery = "SELECT * FROM users WHERE email = \$1";

export async function registerUser(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  let { email, password } = req.body;

  const existingUser = await pool.query(checkExistingUserQuery, [email]);

  if (existingUser.rowCount > 0) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await pool.query(insertUserQuery, [email, hashedPassword]);
  res.json({ message: "Registration successful" });
}

export async function login(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;
  const user = await pool.query(getUserByEmailQuery, [email]);

  if (user.rowCount === 0) {
    res.status(400).send("Invalid email or password");
    return;
  }

  let validPassword = await comparePassword(password, user.rows[0].password);

  if (!validPassword) {
    res.status(400).send("Invalid email or password");
    return;
  }

  const jwtSecret = (process.env.JWT_SECRET) as string;
  const token = jwt.sign({ id: user.rows[0].id }, jwtSecret, { expiresIn: "1h" });

  res.cookie("access_token", token, { httpOnly: true, maxAge });
  res.status(200).json({ message: "Login successful" });
}

export async function hashPassword(password: string) {
  if (!password) {
    throw new Error('Password is required');
  }

  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (err) {
    throw new Error('Hashing failed');
  }
}

export async function comparePassword(password: string, hash: string) {
  return await argon2.verify(hash, password);
}
