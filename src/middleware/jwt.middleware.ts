import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { ApiError } from "../utils/api-error";

import { User } from "../generated/prisma";


interface JwtPayload {
  id: number;
}

export class JwtMiddleware {
  verifyToken = (secretKey: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new ApiError("No Token Provided", 401);
      }

      verify(token, secretKey, (err, payload) => {
        if (err) {
          throw new ApiError("Invalid token or token expired", 401);
        }

        res.locals.user = payload as JwtPayload;
        next();
      });
    };
  };
}
