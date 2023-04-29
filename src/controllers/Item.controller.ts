import { Request, Response } from 'express';
import { pool } from '../services/Database';
import asyncHandler from 'express-async-handler';

const createItemQuery = "INSERT INTO items (name, shopping_list_id,quantity) VALUES (\$1, \$2, \$3) RETURNING *";
const getAllItemsQuery = "SELECT * FROM items ORDER BY id DESC";
const getItemByIdQuery = "SELECT * FROM items WHERE id = \$1";
const getItemByShoppingListIdQuery = "SELECT * FROM items WHERE shopping_list_id = \$1";
const updateItemQuery = "UPDATE items SET name = COALESCE(\$1, name), quantity = COALESCE(\$2, quantity), checked = COALESCE(\$3, checked) WHERE id = \$4 RETURNING *";
const deleteItemQuery = "DELETE FROM items WHERE id = \$1 RETURNING *";

export const createItem = async (req: Request, res: Response): Promise<void> => {
  const { name, shopping_list_id, quantity } = req.body;

  if (!name || !shopping_list_id) {
    res.status(400).json({ error: 'Missing required fields: name and/or shopping_list_id' });
    return;
  }

  const result = await pool.query(createItemQuery, [name, shopping_list_id, quantity]);
  res.status(201).json(result.rows[0]);
};

export const getAllItems = async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query(getAllItemsQuery);
  res.status(200).json({ items: result.rows });
};

export const getItemById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'Missing required field: id' });
    return;
  }

  const result = await pool.query(getItemByIdQuery, [id]);

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'No item found with the given id' });
  } else {
    res.status(200).json(result.rows[0]);
  }
};

export const getItemByShoppingListId = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'Missing required field: id' });
    return;
  }

  const result = await pool.query(getItemByShoppingListIdQuery, [id]);

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'No item found with the given shopping list id' });
  } else {
    res.status(200).json({ items: result.rows });
  }
};

export const updateItem = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, quantity, checked } = req.body;

  if (!id) {
    res.status(400).json({ error: 'Missing required fields: id' });
    return;
  }

  const queryParams = [name, quantity, checked, id];
  const result = await pool.query(updateItemQuery, queryParams);

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'No item found with the given id' });
  } else {
    res.status(200).json(result.rows[0]);
  }
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'Missing required field: id' });
    return;
  }

  const result = await pool.query(deleteItemQuery, [id]);

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'No item found with the given id' });
  } else {
    res.status(200).json(result.rows[0]);
  }
};
