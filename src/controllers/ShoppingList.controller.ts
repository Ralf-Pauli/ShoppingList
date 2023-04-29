import { Request, Response } from 'express';
import { pool } from '../services/Database';
import "../helpers/express.util";
import { SourceTextModule } from 'vm';

const handleError = (error: any, res: Response, errorMessage: string) => {
  const castedError = <Error>error;
  res.status(500).json({ error: errorMessage + castedError.message });
};

const createShoppingListQuery = "INSERT INTO shopping_lists (name, owner_id) VALUES (\$1, \$2) RETURNING *";
const getAllShoppingListsQuery = "SELECT * FROM shopping_lists";
const getAllShoppingListsByOwnerIdQuery = "SELECT * FROM shopping_lists WHERE owner_id = \$1";
const getShoppingListByIdQuery = "SELECT * FROM shopping_lists WHERE name = \$1";
const updateShoppingListQuery = "UPDATE shopping_lists SET name = \$1, updated_at = NOW() WHERE id = \$2 RETURNING *";
const deleteShoppingListQuery = "DELETE FROM shopping_lists WHERE id = \$1 RETURNING *";

export const createShoppingList = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Missing required field: name' });
    return;
  }

  try {
    // Check if a shopping list with the same name already exists
    const existingShoppingList = await pool.query(getShoppingListByIdQuery, [name]);

    if (existingShoppingList.rowCount > 0) {
      res.status(409).json({ error: 'A shopping list with the same name already exists' });
      return;
    }

    // If there is no existing shopping list with the same name, create a new one
    const result = await pool.query(createShoppingListQuery, [name, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    handleError(error, res, 'Error creating shopping list: ');
  }
};

export const getAllShoppingLists = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(getAllShoppingListsQuery);
    res.json({ "shopping-lists": result.rows });
  } catch (error) {
    handleError(error, res, '');
  }
};

export const getAllShoppingListsByOwnerId = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(getAllShoppingListsByOwnerIdQuery, [req.params.id]);
    res.json({ "shopping-lists": result.rows });
  } catch (error) {
    handleError(error, res, '');
  }
};

export const getShoppingListById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(getShoppingListByIdQuery, [req.params.id]);
    res.json(result.rows[0]);
  } catch (error) {
    handleError(error, res, '');
  }
};

export const updateShoppingList = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;
  const { id } = req.params;

  if (!id || !name) {
    res.status(400).json({ error: 'Missing required fields: id and/or name' });
    return;
  }

  try {
    const result = await pool.query(updateShoppingListQuery, [name, id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'No shopping list found with the given id' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    handleError(error, res, 'Error updating shopping list: ');
  }
};

export const deleteShoppingList = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'Missing required field: id' });
    return;
  }

  try {
    const result = await pool.query(deleteShoppingListQuery, [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'No shopping list found with the given id' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    handleError(error, res, 'Error deleting shopping list: ');
  }
};

// share Shopping Lists
const sendSharingInvitationQuery = "INSERT INTO shared_shopping_lists (shopping_list_id, sharing_user_id, receiving_user_id) VALUES (\$1, \$2, \$3) RETURNING *";
const getAllSharedShoppingListsByReceivingUserIdQuery = "SELECT * FROM shared_shopping_lists WHERE receiving_user_id = \$1 AND status = 'accepted'";
const getAllPendingSharedShoppingListsByReceivingUserIdQuery = "SELECT * FROM shared_shopping_lists WHERE receiving_user_id = \$1 AND status = 'pending'";
const updateSharingInvitationQuery = "UPDATE shared_shopping_lists SET status = \$1, updated_at = NOW() WHERE id = \$2 RETURNING *";
const deleteSharingInvitationQuery = "DELETE FROM shared_shopping_lists WHERE id = \$1 RETURNING *";

export const sendSharingInvitation = async (req: Request, res: Response) => {
  const { shopping_list_id, sharing_user_id, receiving_user_id } = req.body;

  if (!shopping_list_id || !sharing_user_id || !receiving_user_id) {
    res.status(400).json({ error: 'Missing required fields: shopping_list_id, sharing_user_id, and/or receiving_user_id' });
    return;
  }

  // check if own shopping list

  try {
    const result = await pool.query(sendSharingInvitationQuery, [shopping_list_id, sharing_user_id, receiving_user_id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    handleError(error, res, 'Error sending sharing invitation: ');
  }
};

export const getAllSharedShoppingListsByReceivingUserId = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(getAllSharedShoppingListsByReceivingUserIdQuery, [req.params.id]);
    res.json({ "shared-shopping-lists": result.rows });
  } catch (error) {
    handleError(error, res, '');
  }
};

export const getAllPendingSharedShoppingListsByReceivingUserId = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(getAllPendingSharedShoppingListsByReceivingUserIdQuery, [req.params.id]);
    res.json({ "pending-shared-shopping-lists": result.rows });
  } catch (error) {
    handleError(error, res, '');
  }
};

export const updateSharingInvitation = async (req: Request, res: Response) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!id || !status) {
    res.status(400).json({ error: 'Missing required fields: id and/or status' });
    return;
  }

  try {
    const result = await pool.query(updateSharingInvitationQuery, [status, id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'No sharing invitation found with the given id' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    handleError(error, res, 'Error updating sharing invitation: ');
  }
};

export const deleteSharingInvitation = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'Missing required field: id' });
    return;
  }

  try {
    const result = await pool.query(deleteSharingInvitationQuery, [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'No sharing invitation found with the given id' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    handleError(error, res, 'Error deleting sharing invitation: ');
  }
};

