import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utils/api-error";
import { PaginationQueryParams } from "../pagination/dto/pagination.dto";
import { PointService } from "./point.service";

export class PointController {
  pointService: PointService;

  constructor() {
    this.pointService = new PointService();
  }

  getUserPointHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = parseInt(req.params.id);
      const query = plainToInstance(PaginationQueryParams, req.query);
      const result = await this.pointService.getUserPointHistory(query, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
