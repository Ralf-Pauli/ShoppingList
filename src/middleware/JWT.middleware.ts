import { NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import * as cookie from 'cookie';
import "../helpers/express.util"

const JWT_SECRET_ERROR = "Server error: JWT secret not defined";
const AUTHENTICATION_REQUIRED_ERROR = "Please authenticate";
const FORBIDDEN_ERROR = 403;

// Middleware to authenticate requests using JWT tokens
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    // Parse cookies from the request headers
    const cookies = cookie.parse(req.headers.cookie || '');
    // Extract the access token from the cookies
    const token = cookies['access_token'];
    const jwtSecret = process.env.JWT_SECRET;
  
    // Check if the JWT secret is defined
    if (!jwtSecret) {
      return res.status(500).send(JWT_SECRET_ERROR);
    }
  
    // Check if the access token is present
    if (!token) {
      return res.status(401).send(AUTHENTICATION_REQUIRED_ERROR);
    }
  
    // Verify the access token using the JWT secret
    jwt.verify(token, jwtSecret as Secret, (err, user) => {
      // If there's an error, send a 403 status (Forbidden)
      if (err) {
        return res.sendStatus(FORBIDDEN_ERROR);
      }
      // If the token is valid, attach the user object to the request and continue to the next middleware or route handler
      req.user = user;
      next();
    });
  };
  