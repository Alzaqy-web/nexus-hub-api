import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utils/api-error";
import { PaginationQueryParams } from "../pagination/dto/pagination.dto";
import { EventService } from "./event.service";

export class EventController {
  eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = plainToInstance(PaginationQueryParams, req.query);
      const result = await this.eventService.getEvents(query);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  getAdminEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUserId = res.locals.user.id;
      const query = plainToInstance(PaginationQueryParams, req.query);
      const result = await this.eventService.getAdminEvents(query, authUserId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getEventBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug;
      const result = await this.eventService.getEventBySlug(slug);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  // // Create
  createEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const thumbnail = files.thumbnail?.[0];

      if (!thumbnail) throw new ApiError("thumbnail is required", 400);

      const user = res.locals.user;

      if (!user) throw new ApiError("Unauthorized", 401);

      const result = await this.eventService.createEvent(
        req.body,
        thumbnail,
        user.id,
        user.role
      );
      res.status(201).send(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const result = await this.eventService.updateEvent(
        req.params.slug,
        req.body,
        res.locals.user.id
      );

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
