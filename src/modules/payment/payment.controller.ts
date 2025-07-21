// payment.controller.ts

import { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { CreatePaymentDTO } from "./dto/create-payment.dto";
import { PaymentService } from "./payment.service";
import { ApiError } from "../../utils/api-error";

export class PaymentController {
  paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  getPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payments = await this.paymentService.getPaymens();

      if (!payments) {
        throw new Error("Failed to fetch payments");
      }

      res.status(200).json(payments);
    } catch (error) {
      next(error);
    }
  };

  getPaymentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new ApiError("Invalid payment ID", 400);

      const payment = await this.paymentService.getPaymentById(id);
      res.status(200).json(payment);
    } catch (error) {
      next(error);
    }
  };

  createPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(CreatePaymentDTO, req.body);
      await validateOrReject(dto);

      const result = await this.paymentService.createPayment(dto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
