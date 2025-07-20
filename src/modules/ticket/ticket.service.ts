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
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!ticket) {
      throw new ApiError("Ticket not found", 404);
    }

    return ticket;
  };

  createTicket = async (data: CreateTicketDTO, authUserId: number) => {
    try {
      const ticket = await this.prisma.ticket.create({
        data: {
          ...data,
          userId: authUserId,
        },
      });
      return ticket;
    } catch (error) {
      throw new ApiError("Failed to create ticket", 500);
    }
  };

  deleteBTicket = async (id: number, authUserId: number) => {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, deletedAt: null },
    });

    if (!ticket) {
      throw new ApiError("Ticket not found", 404);
    }

    if (ticket.userId !== authUserId) {
      throw new ApiError("Unauthorized", 401);
    }

    // Hapus dari cloudinary (jika ada file terkait)
    await this.cloudinaryService.remove(ticket.id.toString());

    // Soft delete ticket
    await this.prisma.ticket.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: "Delete ticket success" };
  };
}
