import express from 'express';
import { check } from 'express-validator';
import asyncHandler from 'express-async-handler';
import { validateBodyZod } from '../middleware/validateBody.middleware';
import { ShoppingListCreationSchema } from '../models/ShoppingList.model';
import {
  createShoppingList,
  getAllShoppingLists,
  getShoppingListById,
  updateShoppingList,
  deleteShoppingList,
  getAllShoppingListsByOwnerId,
  sendSharingInvitation,
  deleteSharingInvitation,
  getAllSharedShoppingListsByReceivingUserId,
  updateSharingInvitation,
  getAllPendingSharedShoppingListsByReceivingUserId,
} from '../controllers/ShoppingList.controller';

const router = express.Router();

// Create a new shopping list
router.post('/', validateBodyZod(ShoppingListCreationSchema), asyncHandler(createShoppingList));
// Get all shopping lists
router.get('/', asyncHandler(getAllShoppingLists));
// Get all shopping lists by owner id
router.get('/owner/:id',  asyncHandler(getAllShoppingListsByOwnerId));
// Get shopping list by id
router.get('/:id',  asyncHandler(getShoppingListById));
// Update shopping list by id
router.put('/:id',  validateBodyZod(ShoppingListCreationSchema), asyncHandler(updateShoppingList));
// Delete shopping list by id
router.delete('/:id',  asyncHandler(deleteShoppingList));

// Send a sharing invitation
router.post('/share', asyncHandler(sendSharingInvitation));
// Get all shared shopping lists by user id
router.get('/shared/user/:id',  asyncHandler(getAllSharedShoppingListsByReceivingUserId));
// Get all pending shared shopping lists by user id
router.get('/shared/pending/user/:id',  asyncHandler(getAllPendingSharedShoppingListsByReceivingUserId));
// Accept or reject a sharing invitation
router.put('/share/:id',  asyncHandler(updateSharingInvitation));
// Delete a sharing invitation
router.delete('/share/:id',  asyncHandler(deleteSharingInvitation));

export default router;
