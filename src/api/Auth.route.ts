import express from "express";
import { login, registerUser, requestPasswordReset, resetPassword } from "../controllers/Auth.controller";
import { validateBodyZod } from "../middleware/validateBody.middleware";
import { AuthSchema } from "../models/Auth.model";
const router = express.Router();

// Register a new user
router.post("/register", validateBodyZod(AuthSchema), registerUser);
// Login
router.post("/login", validateBodyZod(AuthSchema), login);
// Reset Password
router.post("/request_password_reset", requestPasswordReset);
router.post("/reset_password", resetPassword);

export default router;

