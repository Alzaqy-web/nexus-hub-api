import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api.error";

export const errorMiddleware = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = error.status || 500;
  const message = error.message || "something went wrong!";
  res.status(400).send({ message: error.message });
};
