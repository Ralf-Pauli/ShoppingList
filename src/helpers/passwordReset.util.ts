import { getUserByEmailQuery, hashPassword, maxAge } from "../controllers/Auth.controller";
import { pool } from "../services/Database";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { CourierClient } from "@trycourier/courier";
import logger from "./Logger";
import { handleError } from "../middleware/ErrorHandler.middleware"

const requestPasswordResetQuery = "UPDATE users SET reset_token = \$1, reset_token_expires = \$2 WHERE email = \$3";
const resetPasswordQuery = "UPDATE users SET password = \$1, reset_token = null, reset_token_expires = null WHERE email = \$2";

const courier = CourierClient({ authorizationToken: process.env.COURIER_AUTH_TOKEN });
const resetPasswordURL = process.env.RESET_PASSWORD_URL;

export async function requestPasswordReset(req: Request, res: Response) {
    try {
        const { email } = req.body;
        const resetToken = await createResetToken(email);

        res.cookie("resetToken", resetToken, {
            maxAge,
            httpOnly: true,
        });

        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        handleError(error, res, "Server error: ");
    }
}

export async function resetPassword(req: Request, res: Response) {
    try {
        let { email, newPassword } = req.body;
        let token = req.cookies.resetToken;

        try {
            let decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            let resetToken = "";

            if (decoded instanceof String) {
                resetToken = JSON.parse(decoded as string).resetToken;
            } else if (decoded instanceof Object) {
                resetToken = decoded.resetToken;
            }

            await resetUserPassword(email, resetToken, newPassword);
            res.json({ message: "Password reset successful" });
        } catch (err) {
            logger.error("JWT Verification error:", err);
            throw new Error("Could not verify Token");
        }
    } catch (error) {
        handleError(error, res, "Server error: ");
    }
}

async function resetUserPassword(email: string, token: string, newPassword: string) {
    const user = await pool.query(getUserByEmailQuery, [email]);
    if (user.rowCount === 0) {
        throw new Error("User does not exist");
    }

    const resetToken = user.rows[0].reset_token;
    const tokenExpires = user.rows[0].reset_token_expires;

    if (!resetToken || tokenExpires < new Date()) {
        throw new Error("Invalid or expired password reset token");
    }

    if (resetToken !== token) {
        throw new Error("Invalid password reset token");
    }

    const hashedPassword = await hashPassword(newPassword);
    await pool.query(resetPasswordQuery, [hashedPassword, email]);
}

async function createResetToken(email: string) {
    const user = await pool.query(getUserByEmailQuery, [email]);

    if (user.rowCount === 0) {
        throw new Error("User does not exist");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiration = new Date(Date.now() + maxAge);

    await pool.query(requestPasswordResetQuery, [resetToken, expiration, email]);

    const jwtPayload = {
        email,
        resetToken,
    };
    const jwtOptions = {
        expiresIn: maxAge,
    };
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET as string, jwtOptions);

    // Send the reset email
    await sendResetEmail(email, resetToken, user.rows[0].username);

    return token;
}

function createDefaultMessage(email: string, username: string, resetToken: string) {
    return {
        message: {
            to: {
                email: email
            },
            template: "7SPXK05FPBM95MN15JD0SPTSB3XV",
            data: {
                username: username,
                resetPasswordLink: resetPasswordURL + resetToken
            },
            timeout: {
                message: maxAge
            },
        },
    };
}

async function sendResetEmail(email: string, resetToken: string, username: string) {
    const message = createDefaultMessage(email, username, resetToken);
    await courier.send(message);
}
