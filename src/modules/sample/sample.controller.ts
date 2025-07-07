import { NextFunction, Request, Response } from "express";
import { SampleService } from "./sample.service";

export class SampleController {
  sampleService: SampleService;

  constructor() {
    this.sampleService = new SampleService();
  }

  getSamples = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.sampleService.getSamples();
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  getSample = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const result = await this.sampleService.getSample(id);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
