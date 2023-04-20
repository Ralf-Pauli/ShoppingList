import express from 'express';
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
} from '../controllers/Item.controller';
import { validateBodyZod } from '../middleware/validateBody';
import { ItemSchema } from '../models/Item.model';

const router = express.Router();

router.post('/', validateBodyZod(ItemSchema), createItem);
router.get('/', getAllItems);
router.get('/:id', getItemById);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

export default router;
