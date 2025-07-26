import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utils/api-error";
import { PaginationQueryParams } from "../pagination/dto/pagination.dto";
import { DiscountService } from "./discount.service";

export class DiscountController {
  discountService: DiscountService;

  constructor() {
    this.discountService = new DiscountService();
  }

  getUserDiscountHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = parseInt(req.params.id);
      const query = plainToInstance(PaginationQueryParams, req.query);
      const result = await this.discountService.getUserDiscountHistory(
        query,
        userId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
