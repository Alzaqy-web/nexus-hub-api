import { PrismaService } from "../prisma/prisma.service";
import { ApiError } from "../../utils/api-error";
import { CreatePaymentDTO } from "./dto/create-payment.dto";
import { TransactionStatus } from "../../generated/prisma/client";

export class PaymentService {
  prisma: PrismaService;

  constructor() {
    console.log("PaymentService loaded");
    this.prisma = new PrismaService();
  }

  getPaymens = async () => {
    try {
      const payments = await this.prisma.payment.findMany({
        include: {
          transactions: {
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
            },
          },
        },
      });
      return payments;
    } catch (error) {
      throw new ApiError("Failed to fetch payments", 500);
    }
  };

  // Optional: ambil payment berdasarkan transactionId
  getPaymentById = async (id: number) => {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new ApiError("payment not found", 404);
    }

    return payment;
  };

  // Buat payment baru
  createPayment = async (dto: CreatePaymentDTO) => {
    // Cek transaksi valid & status masih PENDING
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: dto.transactionId },
    });

    if (!transaction) throw new ApiError("Transaction not found", 404);
    if (transaction.status !== TransactionStatus.PENDING) {
      throw new ApiError("Transaction is not pending payment", 400);
    }
    // Create payment
    const payment = await this.prisma.payment.create({
      data: {
        transactionId: dto.transactionId,
        method: dto.method,
        reference: dto.reference,
        amountPaid: dto.amountPaid,
        proofUrl: dto.proofUrl,
        paidAt: new Date(),
      },
      include: {
        transactions: {
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
          },
        },
      },
    });

    await this.prisma.transaction.update({
      where: { id: dto.transactionId },
      data: { status: TransactionStatus.PAID },
    });

    if (!payment) {
      throw new ApiError("Failed to create payment", 500);
    }

    return payment;
  };
}
