import express from "express";
import { login, registerUser } from "../controllers/Auth.controller";
import { requestPasswordReset, resetPassword } from "../helpers/passwordReset.util";
import { check } from 'express-validator';
import asyncHandler from 'express-async-handler';
const router = express.Router();

const userValidationRules = [
  check('email')
    .isEmail()
    .withMessage('Email is invalid')
    .normalizeEmail({ gmail_remove_dots: false }),
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

// Register a new user
router.post("/register", userValidationRules, asyncHandler(registerUser));
// Login
router.post("/login", userValidationRules, asyncHandler(login));
// Request password reset
router.post("/request_password_reset", asyncHandler(requestPasswordReset));
// Reset password
router.post("/reset_password", asyncHandler(resetPassword));

export default router;
