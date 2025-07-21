// transaction.service.ts

import { CreateTransactionDTO } from "./dto/create-transaction.dto";
import { PrismaService } from "../prisma/prisma.service";
import { ApiError } from "../../utils/api-error";
import { TransactionStatus } from "../../generated/prisma/client";

export class TransactionService {
  prisma: PrismaService;

  constructor() {
    this.prisma = new PrismaService();
  }

  getUserTransactions = async (userId: number) => {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      include: {
        events: {
          select: {
            title: true,
            slug: true,
            thumbnail: true,
            startDate: true,
            endDate: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return transactions;
  };

  getTransactionById = async (id: number, userId: number) => {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        events: {
          select: {
            title: true,
            slug: true,
            thumbnail: true,
            startDate: true,
            endDate: true,
          },
        },
        payments: true,
      },
    });

    if (!transaction) throw new ApiError("Transaction not found", 404);

    return transaction;
  };

  createTransaction = async (dto: CreateTransactionDTO, userId: number) => {
    const event = await this.prisma.event.findFirst({
      where: { id: dto.eventId, deletedAt: null },
      include: { tickets: true },
    });

    if (!event) throw new ApiError("Event not found", 404);
    const ticket = event.tickets[0];
    if (!ticket) throw new ApiError("No ticket available", 400);
    if (ticket.availableSeats < dto.quantity) {
      throw new ApiError("Insufficient seats", 400);
    }

    const totalPrice = ticket.price * dto.quantity;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        eventId: dto.eventId,
        quantity: dto.quantity,
        totalPrice,
        status: TransactionStatus.PENDING,
        expiresAt,
      },
    });

    return transaction;
  };
}
