import { NextFunction, Request, Response } from "express";
import { AttendeeService } from "./attendee.service";

export class AttendeeController {
  attendeeService: AttendeeService;

  constructor() {
    this.attendeeService = new AttendeeService();
  }

  getAttendeeBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const slug = req.params.slug;
      const result = await this.attendeeService.getAttendeeBySlug(slug);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
