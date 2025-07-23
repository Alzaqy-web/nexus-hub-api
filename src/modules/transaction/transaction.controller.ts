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
      // console.log("User ID dari middleware Token", res.locals.user);
      const userId = res.locals.user;
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
      // console.log("User ID dari middleware Token", res.locals.user.id);
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
  ): Promise<void> => {
    try {
      const dto = plainToInstance(CreateTransactionDTO, req.body);
      await validateOrReject(dto);

      const userId = res.locals.user.id;

      // 🔍 Ambil role user dari database
      const user = await this.transactionService.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user || user.role !== "customer") {
        res
          .status(403)
          .json({ message: "Only customers can make transactions." });
        return;
      }

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
