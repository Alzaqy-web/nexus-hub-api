import { Router } from "express";
import { JwtMiddleware } from "../../middleware/jwt.middleware";
import { UploaderMiddleware } from "../../middleware/uploader.middleware";
import { AttendeeController } from "./attendee.controller";

export class AttendeeRouter {
  private router: Router;
  private attendeeController: AttendeeController;
  private uploaderMiddleware: UploaderMiddleware;
  private jwtMiddleware: JwtMiddleware;

  constructor() {
    this.router = Router();
    this.attendeeController = new AttendeeController();
    this.uploaderMiddleware = new UploaderMiddleware();
    this.jwtMiddleware = new JwtMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get("/:slug", this.attendeeController.getAttendeeBySlug);
  };

  getRouter = () => {
    return this.router;
  };
}
