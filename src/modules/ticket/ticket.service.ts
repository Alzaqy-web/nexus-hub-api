import { ApiError } from "../../utils/api-error";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTicketDTO } from "./dto/create-ticket.dto";

export class TicketService {
  private prisma: PrismaService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
  }
  // get all ticket
  getTickets = async () => {
    try {
      const tickets = await this.prisma.ticket.findMany();
      return tickets;
    } catch (error) {
      throw new ApiError("Failed to fetch tickets", 500);
    }
  };

  // GET single ticket by ID
  getTicketById = async (id: number) => {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id },
      include: { event: true },
    });

    if (!ticket) {
      throw new ApiError("Ticket not found", 404);
    }

    return ticket;
  };
}
