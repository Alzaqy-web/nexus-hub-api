import { Router } from "express";
import { AuthController } from "./auth.controller";
<<<<<<< HEAD
import { validateOrReject } from "class-validator";
import { validateBody } from "../../middlewares/validation.middleware";
=======
import { validateBody } from "../../middleware/validation.middleware";
>>>>>>> main
import { LoginDTO } from "./dto/login.dto";
import { RegisterDTO } from "./dto/register.dto";

export class AuthRouter {
  router: Router;
  authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
<<<<<<< HEAD
    this.initialRoutes();
  }

  private initialRoutes = () => {
=======
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
>>>>>>> main
    this.router.post(
      "/login",
      validateBody(LoginDTO),
      this.authController.login
    );
<<<<<<< HEAD
=======

>>>>>>> main
    this.router.post(
      "/register",
      validateBody(RegisterDTO),
      this.authController.register
    );
<<<<<<< HEAD
  };

  public getRouter = () => {
=======

    this.router.post(
      "/register-eo",
      validateBody(RegisterDTO),
      this.authController.registerAdmin
    );
  };

  getRouter = () => {
>>>>>>> main
    return this.router;
  };
}
