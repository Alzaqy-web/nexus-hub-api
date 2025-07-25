import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: number }; // Sesuai isi token JWT kamu
    }
  }
}
