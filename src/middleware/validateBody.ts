import { Request, Response, NextFunction } from "express";
import { Schema, ZodError } from "zod";

export function validateBodyZod(schema: Schema) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            const error2 = <ZodError>error;
            res.status(400).send(error2.issues);
        }
    };
}
