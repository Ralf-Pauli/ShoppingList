import express from 'express';
import {
  createShoppingList,
  getAllShoppingLists,
  getShoppingListById,
  updateShoppingList,
  deleteShoppingList,
} from '../controllers/ShoppingList.controller';
import { validateBodyZod } from '../middleware/validateBody';
import { ShoppingListSchema } from '../models/ShoppingList.model';

const router = express.Router();

router.post('/',validateBodyZod(ShoppingListSchema), createShoppingList);
router.get('/', getAllShoppingLists);
router.get('/:id', getShoppingListById);
router.put('/:id', updateShoppingList);
router.delete('/:id', deleteShoppingList);

export default router;
