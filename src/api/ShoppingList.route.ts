import express from 'express';
import {
  createShoppingList,
  getAllShoppingLists,
  getShoppingListById,
  updateShoppingList,
  deleteShoppingList,
  getAllShoppingListsByOwnerId,
} from '../controllers/ShoppingList.controller';
import { validateBodyZod } from '../middleware/validateBody.middleware';
import { ShoppingListCreationSchema } from '../models/ShoppingList.model';

const router = express.Router();

// Create a new shopping list
router.post('/', validateBodyZod(ShoppingListCreationSchema), createShoppingList);
// Get all shopping lists
router.get('/', getAllShoppingLists);
// Get all shopping lists by owner id
router.get('/owner/:id', getAllShoppingListsByOwnerId);
// Get shopping list by id
router.get('/:id', getShoppingListById);
// Update shopping list by id
router.put('/:id', validateBodyZod(ShoppingListCreationSchema), updateShoppingList);
// Delete shopping list by id
router.delete('/:id', deleteShoppingList);

export default router;
