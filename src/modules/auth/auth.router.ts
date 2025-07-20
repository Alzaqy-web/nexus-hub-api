import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateBody } from "../../middleware/validation.middleware";
import { LoginDTO } from "./dto/login.dto";
import { RegisterDTO } from "./dto/register.dto";

export class AuthRouter {
  router: Router;
  authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post(
      "/login",
      validateBody(LoginDTO),
      this.authController.login
    );

    this.router.post(
      "/register",
      validateBody(RegisterDTO),
      this.authController.register
    );

    this.router.post(
      "/register-eo",
      validateBody(RegisterDTO),
      this.authController.registerAdmin
    );
  };

  getRouter = () => {
    return this.router;
  };
}
