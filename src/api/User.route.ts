import express from 'express';
import { check } from 'express-validator';
import asyncHandler from 'express-async-handler';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/User.controller';

const router = express.Router();

// Get all users
router.get('/', asyncHandler(getAllUsers));
// Get user by id
router.get('/:id', asyncHandler(getUserById));
// Update user by id
router.put('/:id', asyncHandler(updateUser));
// Delete user by id
router.delete('/:id', asyncHandler(deleteUser));

export default router;
