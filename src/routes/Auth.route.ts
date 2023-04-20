import express from "express";
import { registerUser } from "../controllers/Auth.controller";
import { validateBodyZod } from "../middleware/validateBody";
import { AuthSchema } from "../models/Auth.model";

const router = express.Router();

router.post('/register', validateBodyZod(AuthSchema), registerUser);

export default router;