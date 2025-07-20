import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export class JwtMiddleware {
  verifyToken(secretKey: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Token missing" });
      }

      const token = authHeader.split(" ")[1];

      try {
        const decoded = jwt.verify(token, secretKey) as JwtPayload & {
          id: number;
        };
        req.user = decoded; // ✅ ini sekarang valid
        next();
      } catch (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }
    };
  }
}
