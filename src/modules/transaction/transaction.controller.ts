import { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { CreateTransactionDTO } from "./dto/create-transaction.dto";
import { TransactionService } from "./transaction.service";

export class TransactionController {
  transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  getUserTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = res.locals.user.id;
      const result = await this.transactionService.getUserTransactions(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getTransactionById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = parseInt(req.params.id);
      const userId = res.locals.user.id;

      const result = await this.transactionService.getTransactionById(
        id,
        userId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  createTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const dto = plainToInstance(CreateTransactionDTO, req.body);
      await validateOrReject(dto);
      const userId = res.locals.user.id;
      const result = await this.transactionService.createTransaction(
        dto,
        userId
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
