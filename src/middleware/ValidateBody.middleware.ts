import { Request, Response, NextFunction } from "express";
import { Schema, ZodError } from "zod";

// Middleware to validate request body using a Zod schema
export function validateBodyZod(schema: Schema) {
    // Asynchronous middleware function
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate request body using the provided schema
            await schema.parseAsync(req.body);
            // If validation is successful, continue to the next middleware or route handler
            next();
        } catch (error) {
            // If there's a ZodError, send a 400 status with the error details
            if (error instanceof ZodError) {
                res.status(400).send(error.issues);
            } else {
                // If it's another error, pass it to the next error handling middleware
                next(error);
            }
        }
    };
}

