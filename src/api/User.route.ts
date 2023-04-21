// routes/User.route.js
import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/User.controller";

const router = express.Router();

// Get all users
router.get("/", getAllUsers);
// Get user by id
router.get("/:id", getUserById);
// Update user by id
router.put("/:id", updateUser);
// Delete user by id
router.delete("/:id", deleteUser);

export default router;
