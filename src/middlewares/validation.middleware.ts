import { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export const validateBody = (dto: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // console.log("ini req body", req.body);
    const dtoInstance = plainToInstance(dto, req.body);
    // console.log("ini dto instance", dtoInstance);

    const errors = await validate(dtoInstance);

    // console.log("ini isi errors", errors);
    if (errors.length > 0) {
      const message = errors
        .map((error) => Object.values(error.constraints || {}).join(","))
        .join(", ");

      res.status(400).send({ message });
      return;
    }

    next();
  };
};
