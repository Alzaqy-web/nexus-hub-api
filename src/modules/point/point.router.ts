import { Router } from "express";
import { PointController } from "./point.controller";
import { JwtMiddleware } from "../../middleware/jwt.middleware";
import { UploaderMiddleware } from "../../middleware/uploader.middleware";
import { JWT_SECRET } from "../../config/env";

export class PointRouter {
  private router: Router;
  private pointController: PointController;
  private jwtMiddleware: JwtMiddleware;
  private uploaderMiddleware: UploaderMiddleware;

  constructor() {
    this.router = Router();
    this.pointController = new PointController();
    this.jwtMiddleware = new JwtMiddleware();
    this.uploaderMiddleware = new UploaderMiddleware();
    this.initialRoutes();
  }

  private initialRoutes = () => {
    this.router.get(
      "/point-history/:id",
      this.jwtMiddleware.verifyToken(JWT_SECRET!),
      this.pointController.getUserPointHistory
    );
  };

  getRouter = () => {
    return this.router;
  };
}
