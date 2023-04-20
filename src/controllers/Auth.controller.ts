import { Request, Response } from "express";
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { pool } from "../services/database";
import dotenv from 'dotenv';
import { SourceTextModule } from "vm";
import { randomUUID } from "crypto";

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const existingUser = await pool.query('SELECT * FROM users WHERE email = \$1', [email]);
        if (existingUser.rowCount > 0) {
            return res.status(400).send('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            'INSERT INTO users (email, password) VALUES (\$1, \$2) RETURNING *',
            [email, hashedPassword]
        );

        res.json(newUser.rows[0]);
    } catch (error) {
        let error2 = <Error>error;
        res.status(500).send("Server error: " + error2.message);
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await pool.query('SELECT * FROM users WHERE email = \$1', [email]);
        if (user.rowCount === 0) {
            return res.status(400).send('Invalid email or password');
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).send('Invalid email or password');
        }

        const jwtSecret = (process.env.JWT_SECRET) as string;
        const token = jwt.sign({ id: user.rows[0].id }, jwtSecret, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).send('Server error');
    }
};
