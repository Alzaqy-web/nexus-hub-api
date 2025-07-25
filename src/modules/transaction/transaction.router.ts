import { Router } from "express";
import { TransactionController } from "./transaction.controller";

import { JWT_SECRET } from "../../config/env";
import { JwtMiddleware } from "../../middleware/jwt.middleware";

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
    this.router.get("/", this.transactionController.getUserTransactions);
    this.router.get(
      "/admin",
      this.jwtMiddleware.verifyToken(JWT_SECRET!),
      this.transactionController.getAdminTransactions
    );
    this.router.get(
      "/:id",
      this.jwtMiddleware.verifyToken(JWT_SECRET!),
      this.transactionController.getTransactionById
    );
    this.router.post(
      "/",
      this.jwtMiddleware.verifyToken(JWT_SECRET!),
      this.transactionController.createTransaction
    );
    this.router.patch(
      "/approve/:id",
      this.jwtMiddleware.verifyToken(JWT_SECRET!),
      this.transactionController.approvalTransaction
    );
    this.router.patch(
      "/reject/:id",
      this.jwtMiddleware.verifyToken(JWT_SECRET!),
      this.transactionController.rejectTransaction
    );
  };

  getRouter = () => {
    return this.router;
  };
}
