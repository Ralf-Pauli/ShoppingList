import { Response } from "express";
import logger from "../helpers/Logger";

export function handleError(error: any, res: Response, errorMessage: string) {
    const castedError = <Error>error;
    logger.error('Error:', castedError.message, castedError.stack);
    res.status(500).send(errorMessage + castedError.message);
}