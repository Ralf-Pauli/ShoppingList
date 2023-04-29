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
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Create a new item
router.post('/', validateBodyZod(ItemCreationSchema), asyncHandler(createItem));
// Get all items
router.get('/', asyncHandler(getAllItems));
// Get item by id
router.get('/:id', asyncHandler(getItemById));
// Get items by shopping list id
router.get('/shopping-list/:id', asyncHandler(getItemByShoppingListId));
// Update item by id
router.put('/:id', asyncHandler(updateItem));
// Delete item by id
router.delete('/:id', asyncHandler(deleteItem));

export default router;
