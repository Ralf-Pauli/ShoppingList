// app.ts
import express, { Express } from "express";
import dotenv from "dotenv";
import shoppingListRoutes from "./routes/ShoppingList.route";
import itemRoutes from "./routes/Item.route";
import userAuthRoutes from "./routes/Auth.route";
import { authenticateJWT } from "./middleware/JWT.middleware";
import setupMiddleware from "./middleware/setup.middleware";
import { notFoundHandler } from "./middleware/notFoundHandler.middleware";
import { errorHandler } from "./middleware/errorHandler.middleware";

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
app.use(errorHandler);

export default app;