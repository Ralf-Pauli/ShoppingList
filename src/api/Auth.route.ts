import express from "express";
import { login, registerUser } from "../controllers/Auth.controller";
import { validateBodyZod } from "../middleware/validateBody.middleware";
import { AuthSchema } from "../models/Auth.model";

const router = express.Router();

// Register a new user
router.post("/register", validateBodyZod(AuthSchema), registerUser);
// Login
router.post("/login", validateBodyZod(AuthSchema), login);
export default router;

