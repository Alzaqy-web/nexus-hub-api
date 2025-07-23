import { Router } from "express";
import { EventController } from "./event.controller";

import { JWT_SECRET } from "../../config/env";

import { CreateEventDTO } from "./dto/create-event.dto";
import { JwtMiddleware } from "../../middleware/jwt.middleware";
import { UploaderMiddleware } from "../../middleware/uploader.middleware";
import { validateBody } from "../../middleware/validation.middleware";

export class EventRouter {
  private router: Router;
  private eventController: EventController;
  private jwtMiddleware: JwtMiddleware;
  private uploaderMiddleware: UploaderMiddleware;

  constructor() {
    this.router = Router();
    this.eventController = new EventController();
    this.jwtMiddleware = new JwtMiddleware();
    this.uploaderMiddleware = new UploaderMiddleware();
    this.initialRoutes();
  }

  private initialRoutes = () => {
    this.router.get("/", this.eventController.getEvents);
    this.router.get("/:slug", this.eventController.getEventBySlug);
    this.router.post(
      "/",
      this.jwtMiddleware.verifyToken(JWT_SECRET!),
      this.uploaderMiddleware
        .getUploader()
        .fields([{ name: "thumbnail", maxCount: 1 }]),
      this.uploaderMiddleware.fileFilter([
        "image/jpeg",
        "image/png",
        "image/apng",
      ]),
      validateBody(CreateEventDTO),
      this.eventController.createEvents
    );
    // this.router.delete(
    //   "/:id",
    //   this.jwtMiddleware.verifyToken(JWT_SECRET!),
    //   this.eventController.deleteEvent
    // );
  };

  getRouter = () => {
    return this.router;
  };
}
