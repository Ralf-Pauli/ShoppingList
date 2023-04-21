import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../services/Database";

const handleError = (error: any, res: Response, errorMessage: string) => {
  const castedError = <Error>error;
  res.status(500).send(errorMessage + castedError.message);
};

const checkExistingUserQuery = "SELECT * FROM users WHERE email = \$1";
const insertUserQuery = "INSERT INTO users (email, password) VALUES (\$1, \$2) RETURNING *";
const getUserByEmailQuery = "SELECT * FROM users WHERE email = \$1";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await pool.query(checkExistingUserQuery, [email]);
    if (existingUser.rowCount > 0) {
      return res.status(400).send("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(insertUserQuery, [email, hashedPassword]);
    res.json({ message: "Registration successful" });
  } catch (error) {
    handleError(error, res, "Server error: ");
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query(getUserByEmailQuery, [email]);
    if (user.rowCount === 0) {
      return res.status(400).send("Invalid email or password");
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).send("Invalid email or password");
    }

    const jwtSecret = (process.env.JWT_SECRET) as string;
    const token = jwt.sign({ id: user.rows[0].id }, jwtSecret, { expiresIn: "1h" });

    res.cookie("access_token", token, { httpOnly: true, maxAge: 3600000 }); // 1 hour expiration
    res.json({ message: "Login successful" });
  } catch (error) {
    handleError(error, res, "Server error: ");
  }
};
