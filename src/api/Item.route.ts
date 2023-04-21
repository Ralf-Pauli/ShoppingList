import express from 'express';
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  getItemByShoppingListId,
} from '../controllers/Item.controller';
import { validateBodyZod } from '../middleware/validateBody.middleware';
import { ItemCreationSchema } from '../models/Item.model';


const router = express.Router();

// Create a new item
router.post('/', validateBodyZod(ItemCreationSchema), createItem);
// Get all items
router.get('/', getAllItems);
// Get item by id
router.get('/:id', getItemById);
// Get items by shopping list id
router.get('/shopping-list/:id', getItemByShoppingListId);
// Update item by id
router.put('/:id', updateItem);
// Delete item by id
router.delete('/:id', deleteItem);

export default router;
