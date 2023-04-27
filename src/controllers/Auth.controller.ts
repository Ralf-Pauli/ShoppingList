import { Request, Response, json } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { pool } from "../services/Database";
import crypto, { privateDecrypt } from "crypto";
import { CourierClient } from "@trycourier/courier";
import { object } from "zod";

const courier = CourierClient({ authorizationToken: "pk_prod_GQ6KFP4GJE4Y40QEH566Z6V4BTWH" });

const maxAge = 3600000; // 1 hour in ms
const resetPasswordURL = "http://localhost:3000/api/users/reset_password";

const defaultMessage = {
  message: {
    to: {
      email: ""
    },
    template: "7SPXK05FPBM95MN15JD0SPTSB3XV",
    data: {
      username: "",
      resetPasswordLink: resetPasswordURL
    },
    timeout: {
      message: maxAge
    },
  },
};

export const handleError = (error: any, res: Response, errorMessage: string) => {
  const castedError = <Error>error;
  res.status(500).send(errorMessage + castedError.message);
};

const checkExistingUserQuery = "SELECT * FROM users WHERE email = \$1";
const insertUserQuery = "INSERT INTO users (email, password) VALUES (\$1, \$2) RETURNING *";
export const getUserByEmailQuery = "SELECT * FROM users WHERE email = \$1";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await pool.query(checkExistingUserQuery, [email]);
    if (existingUser.rowCount > 0) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await hashPassword(password)

    const newUser = await pool.query(insertUserQuery, [email, hashedPassword]);
    res.json({ message: "Registration successful" });
  } catch (error) {
    handleError(error, res, "Server error: ");
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query(getUserByEmailQuery, [email]);
    if (user.rowCount === 0) {
      return res.status(400).send("Invalid email or password");
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).send("Invalid email or password");
    }

    const jwtSecret = (process.env.JWT_SECRET) as string;
    const token = jwt.sign({ id: user.rows[0].id }, jwtSecret, { expiresIn: "1h" });

    res.cookie("access_token", token, { httpOnly: true, maxAge: maxAge }); // 1 hour expiration
    res.json({ message: "Login successful" });
  } catch (error) {
    handleError(error, res, "Server error: ");
  }
};

const createResetToken = async (email: string) => {
  const user = await pool.query(getUserByEmailQuery, [email]);
  if (user.rowCount === 0) {
    throw new Error("User does not exist");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiration = new Date(Date.now() + maxAge);

  await pool.query("UPDATE users SET reset_token = \$1, reset_token_expires = \$2 WHERE email = \$3", [resetToken, expiration, email]);

  // Create a JWT containing the email and reset token
  const jwtPayload = {
    email,
    resetToken,
  };
  const jwtOptions = {
    expiresIn: maxAge,
  };
  const token = jwt.sign(jwtPayload, process.env.JWT_SECRET as string, jwtOptions);

  return token;
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const resetToken = await createResetToken(email);

    res.cookie("resetToken", resetToken, {
      maxAge,
      httpOnly: true,
    });

    // Send the reset token to the user's email using your email sending library
    defaultMessage.message.to.email = email;
    defaultMessage.message.data.username = email;
    const { requestId } = await courier.send(defaultMessage);

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    handleError(error, res, "Server error: ");
  }
};

export const resetPassword = async (req: Request, res: Response) => {
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
      console.error("JWT Verification error:", err);
      throw new Error("Could not verify Token");
    }
  } catch (error) {
    handleError(error, res, "Server error: ");
  }
};

export const resetUserPassword = async (email: string, token: string, newPassword: string) => {
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

  const hashedPassword = await hashPassword(newPassword)
  await pool.query("UPDATE users SET password = \$1, reset_token = null, reset_token_expires = null WHERE email = \$2", [hashedPassword, email]);
};

const hashPassword = async (password: string) => {
  if (!password) {
    throw new Error('Password is required');
  }

  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);

  if (!salt) {
    throw new Error('Salt generation failed');
  }

  return await bcrypt.hash(password, salt);;
};