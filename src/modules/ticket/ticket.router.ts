import { Router } from "express";

import { TicketController } from "./ticket.controller";
import { JWT_SECRET } from "../../config/env";
import { CreateTicketDTO } from "./dto/create-ticket.dto";
import { JwtMiddleware } from "../../middleware/jwt.middleware";
import { validateBody } from "../../middleware/validation.middleware";

// console.log("CreateTicketDTO at import:", CreateTicketDTO);
export class TicketRouter {
  private router: Router;
  private ticketController: TicketController;
  private jwtMiddleware: JwtMiddleware;

  constructor() {
    this.router = Router();
    this.ticketController = new TicketController();
    this.jwtMiddleware = new JwtMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    // Public route untuk ambil semua tiket
    this.router.get("/", this.ticketController.getTickets);
    this.router.get("/:id", this.ticketController.getTicketById);
    // this.router.post(
    //   "/",
    //   this.jwtMiddleware.verifyToken(JWT_SECRET!),
    //   validateBody(CreateTicketDTO),
    //   this.ticketController.createTicket
    // );
  };

  getRouter = () => this.router;
}
