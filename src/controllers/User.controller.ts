import { Request, Response } from 'express';
import { pool } from '../services/database';

// export const createUser = async (req: Request, res: Response) => {
//   try {
//     const { name, email } = req.body;
//     const result = await pool.query(
//       'INSERT INTO users (name, email) VALUES (\$1, \$2) RETURNING *',
//       [name, email]
//     );
//     res.status(201).json({ user: result.rows[0] });
//   } catch (error) {
//     let error2 = <Error>error;
//     res.status(500).json({ error: error2.message });
//   }
// };

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.status(200).json({ users: result.rows });
  } catch (error) {
    let error2 = <Error>error;
    res.status(500).json({ error: error2.message });
  }
};


export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = \$1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    let error2 = <Error>error;
    res.status(500).json({ error: error2.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const result = await pool.query(
      'UPDATE users SET name = \$1, email = \$2 WHERE id = \$3 RETURNING *',
      [name, email, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    let error2 = <Error>error;
    res.status(500).json({ error: error2.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = \$1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).json({ message: 'User deleted successfully' });
  } catch (error) {
    let error2 = <Error>error;
    res.status(500).json({ error: error2.message });
  }
};
