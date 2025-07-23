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

  getPayments = async (userId: number) => {
    try {
      const payments = await this.prisma.payment.findMany({
        where: {
          transactions: {
            userId: userId, // filter hanya transaksi milik user ini
          },
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
  createPayment = async (dto: CreatePaymentDTO, userId: number) => {
    // Cek transaksi valid & milik user yang sesuai
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: dto.transactionId,
        userId: userId, // validasi user yang punya transaksi ini
      },
    });

    if (!transaction) throw new ApiError("Transaction not found", 404);

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new ApiError("Transaction is not pending payment", 400);
    }
    console.log("Transaction ID from request:", dto.transactionId);

    const existingPayment = await this.prisma.payment.findUnique({
      where: { transactionId: dto.transactionId },
    });

    if (existingPayment) {
      throw new ApiError("Payment for this transaction already exists", 400);
    }

    if (dto.amountPaid < transaction.totalPrice) {
      throw new ApiError(
        "Amount paid is less than transaction total price",
        400
      );
    }

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

    return payment;
  };
}
