// app.ts
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import shoppingListRoutes from './routes/ShoppingList.route';
import itemRoutes from './routes/Item.route';
import userRoutes from './routes/User.route';
import authRoutes from './routes/Auth.route';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

dotenv.config();

const app: Express = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/shopping-lists', shoppingListRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
