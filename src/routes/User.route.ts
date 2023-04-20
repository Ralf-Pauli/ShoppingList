import express from 'express';
import { register } from 'ts-node';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/User.controller';

const router = express.Router();


router.post("/login")
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
