import { Router } from "express";
import { TransactionController } from "./transaction.controller";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { JWT_SECRET } from "../../config/env";

export class TransactionRouter {
  private router: Router;
  private transactionController: TransactionController;
  private jwtMiddleware: JwtMiddleware;

  constructor() {
    this.router = Router();
    this.transactionController = new TransactionController();
    this.jwtMiddleware = new JwtMiddleware();
    this.initialRoutes();
  }

  private initialRoutes = () => {
    this.router.post(
      "/",
      this.jwtMiddleware.verifyToken(JWT_SECRET!),
      this.transactionController.createTransaction
    );
    this.router.get(
      "/",
      this.jwtMiddleware.verifyToken(JWT_SECRET!),
      this.transactionController.getUserTransactions
    );
    this.router.get(
      "/:id",
      this.jwtMiddleware.verifyToken(JWT_SECRET!),
      this.transactionController.getTransactionById
    );
  };

  getRouter = () => {
    return this.router;
  };
}
