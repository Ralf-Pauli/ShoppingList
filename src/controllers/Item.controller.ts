import { Request, Response } from 'express';
import { pool } from '../services/database';

const handleError = (error: any, res: Response, errorMessage: string) => {
  const castedError = <Error>error;
  res.status(500).json({ error: errorMessage + castedError.message });
};

const createItemQuery = "INSERT INTO items (name, shopping_list_id) VALUES (\$1, \$2) RETURNING *";
const getAllItemsQuery = "SELECT * FROM items ORDER BY id DESC";
const getItemByIdQuery = "SELECT * FROM items WHERE id = \$1";
const getItemByShoppingListIdQuery = "SELECT * FROM items WHERE shopping_list_id = \$1";
const updateItemQuery = "UPDATE items SET name = \$1 WHERE id = \$2 RETURNING *";
const deleteItemQuery = "DELETE FROM items WHERE id = \$1 RETURNING *";

export const createItem = async (req: Request, res: Response) => {
  const { name, shopping_list_id } = req.body;

  if (!name || !shopping_list_id) {
    res.status(400).json({ error: 'Missing required fields: name and/or shopping_list_id' });
    return;
  }

  try {
    const result = await pool.query(createItemQuery, [name, shopping_list_id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    handleError(error, res, 'Error creating item: ');
  }
};

export const getAllItems = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(getAllItemsQuery);
    res.status(200).json({ items: result.rows });
  } catch (error) {
    handleError(error, res, 'Error fetching items: ');
  }
};

export const getItemById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'Missing required field: id' });
    return;
  }

  try {
    const result = await pool.query(getItemByIdQuery, [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'No item found with the given id' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    handleError(error, res, 'Error fetching item by id: ');
  }
};

export const getItemByShoppingListId = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'Missing required field: id' });
    return;
  }

  try {
    const result = await pool.query(getItemByShoppingListIdQuery, [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'No item found with the given shopping list id' });
    } else {
      res.status(200).json({ items: result.rows });
    }
  } catch (error) {
    handleError(error, res, 'Error fetching item by shopping_list_id: ');
  }
};

export const updateItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!id || !name) {
    res.status(400).json({ error: 'Missing required fields: id and/or name' });
    return;
  }

  try {
    const result = await pool.query(updateItemQuery, [name, id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'No item found with the given id' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    handleError(error, res, 'Error updating item: ');
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'Missing required field: id' });
    return;
  }

  try {
    const result = await pool.query(deleteItemQuery, [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'No item found with the given id' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    handleError(error, res, 'Error updating item: ');
  }
};
