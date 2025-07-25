import { Router } from "express";
import { JwtMiddleware } from "../../middleware/jwt.middleware";
import { UploaderMiddleware } from "../../middleware/uploader.middleware";
import { JWT_SECRET } from "../../config/env";
import { DiscountController } from "./discount.controller";

export class DiscountRouter {
  private router: Router;
  private discountController: DiscountController;
  private jwtMiddleware: JwtMiddleware;
  private uploaderMiddleware: UploaderMiddleware;

  constructor() {
    this.router = Router();
    this.discountController = new DiscountController();
    this.jwtMiddleware = new JwtMiddleware();
    this.uploaderMiddleware = new UploaderMiddleware();
    this.initialRoutes();
  }

  private initialRoutes = () => {
    this.router.get(
      "/:id",
      this.jwtMiddleware.verifyToken(JWT_SECRET!),
      this.discountController.getUserDiscountHistory
    );
  };

  getRouter = () => {
    return this.router;
  };
}
