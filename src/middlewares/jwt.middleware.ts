import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { ApiError } from "../utils/api.error";

interface JwtPayload {
  id: number;
}

export class JwtMiddleware {
  verifyToken = (secretKey: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization?.split(" ")[1];

      // console.log("🔐 AUTH HEADER:", token);
      if (!token) {
        // console.warn("⛔ No token provided.");
        throw new ApiError("No Token Provided", 401);
      }

      verify(token, secretKey, (err, payload) => {
        if (err) {
          // console.error("⛔ Token verification failed:", err.message);
          throw new ApiError("Invalid token or token expired", 401);
        }

        // console.log("✅ USER PAYLOAD:", payload); // Log payload
        res.locals.user = payload as JwtPayload;
        next();
      });
    };
  };
}
