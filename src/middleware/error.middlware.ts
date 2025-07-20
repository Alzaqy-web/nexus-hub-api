import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";

export const errorMiddleware = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = error.status || 500;
  const message = error.message || "Something went wrong";
  res.status(status).send({ message });
};
