import { sign } from "jsonwebtoken";

export class tokenService {
  generateToken = (playload: object, secretKey: string) => {
    return sign(playload, secretKey, { expiresIn: "2h" }); //"2h" 30m
  };
}
