import { NextFunction, Request, Response } from "express";
import { TicketService } from "./ticket.service";
import { ApiError } from "../../utils/api-error";

export class TicketController {
  ticketService: TicketService;

  constructor() {
    this.ticketService = new TicketService();
  }

  getTickets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tickets = await this.ticketService.getTickets();

      if (!tickets) {
        throw new Error("Failed to fetch tickets");
      }

      res.status(200).json(tickets);
    } catch (error) {
      next(error);
    }
  };

  getTicketById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new ApiError("Invalid ticket ID", 400);

      const ticket = await this.ticketService.getTicketById(id);
      res.status(200).json(ticket);
    } catch (error) {
      next(error);
    }
  };

  createTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUserId = res.locals.user.id;
      const ticket = await this.ticketService.createTicket(
        req.body,
        authUserId
      );
      res.status(201).json(ticket);
    } catch (error) {
      next(error);
    }
  };
}
