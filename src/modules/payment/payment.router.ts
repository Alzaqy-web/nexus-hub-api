// payment.router.ts

import { Router } from "express";
import { PaymentController } from "./payment.controller";

import { JWT_SECRET } from "../../config/env";
import { JwtMiddleware } from "../../middleware/jwt.middleware";

export class PaymentRouter {
  private router: Router;
  private paymentController: PaymentController;
  private jwtMiddleware: JwtMiddleware;

  constructor() {
    this.router = Router();
    this.paymentController = new PaymentController();
    this.jwtMiddleware = new JwtMiddleware();
    this.initRoutes();
  }

  private initRoutes() {
    // Buat pembayaran baru
    this.router.get("/", this.paymentController.getPayments);
    this.router.get(
      "/:id",
      this.jwtMiddleware.verifyToken(JWT_SECRET!),
      this.paymentController.getPaymentById
    );

    this.router.post(
      "/",
      this.jwtMiddleware.verifyToken(JWT_SECRET!),
      this.paymentController.createPayment
    );

    // Ambil pembayaran berdasarkan transactionId
  }

  getRouter() {
    return this.router;
  }
}
