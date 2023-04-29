import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import express, { Express } from "express";
import cookieParser from "cookie-parser";

export default function setupMiddleware(app: Express) {
  app.use(cors());
  app.use(helmet());
  // app.use(morgan(process.env.LOG_FORMAT || "dev"));
  app.use(express.json());
  app.use(cookieParser());
}