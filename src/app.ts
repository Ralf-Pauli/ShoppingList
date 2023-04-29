// app.ts
import express, { Express } from "express";
import dotenv from "dotenv";
import shoppingListRoutes from "./api/ShoppingList.route";
import itemRoutes from "./api/Item.route";
import userAuthRoutes from "./api/Auth.route";
import { authenticateJWT } from "./middleware/JWT.middleware";
import setupMiddleware from "./middleware/setup.middleware";
import { notFoundHandler } from "./middleware/notFoundHandler.middleware";
import { handleError } from "./middleware/ErrorHandler.middleware";

dotenv.config();

const app: Express = express();

// Configure middleware
setupMiddleware(app);

// Configure routes
app.use("/api/shopping-lists", authenticateJWT, shoppingListRoutes);
app.use("/api/items", authenticateJWT, itemRoutes);
app.use("/api/users", userAuthRoutes);
// app.use("/api/user", userRoutes);

app.use(notFoundHandler);

export default app;