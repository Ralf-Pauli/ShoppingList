import { Request, Response } from 'express';
import { pool } from '../services/Database';

const handleError = (error: any, res: Response) => {
  const castedError = <Error>error;
  res.status(500).json({ error: castedError.message });
}; 

const getAllUsersQuery = 'SELECT * FROM users';
const getUserByIdQuery = 'SELECT * FROM users WHERE id = \$1';
const updateUserQuery = 'UPDATE users SET name = \$1, email = \$2 WHERE id = \$3 RETURNING *';
const deleteUserQuery = 'DELETE FROM users WHERE id = \$1';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const queryResult = await pool.query(getAllUsersQuery);
    res.status(200).json({ users: queryResult.rows });
  } catch (error) {
    handleError(error, res);
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const queryResult = await pool.query(getUserByIdQuery, [id]);
    if (queryResult.rowCount === 0) {
      res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user: queryResult.rows[0] });
  } catch (error) {
    handleError(error, res);
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const queryResult = await pool.query(updateUserQuery, [name, email, id]);
    if (queryResult.rowCount === 0) {
      res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user: queryResult.rows[0] });
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const queryResult = await pool.query(deleteUserQuery, [id]);
    if (queryResult.rowCount === 0) {
      res.status(404).json({ error: 'User not found' });
    }
    res.status(204).json({ message: 'User deleted successfully' });
  } catch (error) {
    handleError(error, res);
  }
};
