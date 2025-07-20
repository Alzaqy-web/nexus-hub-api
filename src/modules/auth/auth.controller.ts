import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
