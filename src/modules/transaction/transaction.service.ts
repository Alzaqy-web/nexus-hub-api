import { TransactionStatus } from "../../generated/prisma/client";
import { ApiError } from "../../utils/api-error";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransactionDTO } from "./dto/create-transaction.dto";

export class TransactionService {
  prisma: PrismaService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
  }

  getUserTransactions = async (userId: number) => {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      include: {
        events: {
          // pastikan ini sesuai nama relasi di Prisma schema kamu (event, bukan events)
          select: {
            title: true,
            slug: true,
            thumbnail: true,
            startDate: true,
            endDate: true,
            location: true,
          },
        },
        transactionTickets: {
          include: {
            ticket: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        payments: true,
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // console.log("transactions", transactions);
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
            location: true,
          },
        },
        transactionTickets: {
          include: {
            ticket: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        payments: true,
        user: {
          select: {
            name: true,
            email: true,
            // phone: true,
            role: true,
          },
        },
      },
    });

    // console.log("🔍 getTransactionById called with:", { id, userId });

    if (!transaction) throw new ApiError("Transaction not found", 404);

    return transaction;
  };

  // createTransaction = async (dto: CreateTransactionDTO, userId: number) => {
  //   const event = await this.prisma.event.findFirst({
  //     where: { id: dto.eventId, deletedAt: null },
  //     include: { tickets: true },
  //   });

  //   if (!event) throw new ApiError("Event not found", 404);

  //   // cek seats dan hitung totalPrice sekaligus pakai reduce
  //   const totalPrice = dto.tickets.reduce((acc, t) => {
  //     const ticket = event.tickets.find((ticket) => ticket.id === t.ticketId);
  //     if (!ticket) throw new ApiError(`Ticket ID ${t.ticketId} not found`, 404);
  //     if (ticket.availableSeats < t.quantity)
  //       throw new ApiError(
  //         `Insufficient seats for ticket ID ${t.ticketId}`,
  //         400
  //       );

  //     return acc + ticket.price * t.quantity;
  //   }, 0);

  //   const totalQuantity = dto.tickets.reduce((acc, t) => acc + t.quantity, 0);

  //   const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

  //   // Disarankan menggunakan transaksi database untuk pengurangan kursi
  //   const transaction = await this.prisma.$transaction(
  //     async (prismaTransaction) => {
  //       const newTransaction = await prismaTransaction.transaction.create({
  //         data: {
  //           userId,
  //           eventId: dto.eventId,
  //           quantity: totalQuantity,
  //           totalPrice,
  //           status: TransactionStatus.PENDING,
  //           expiresAt,
  //           transactionTickets: {
  //             create: dto.tickets.map((t) => ({
  //               ticketId: t.ticketId,
  //               quantity: t.quantity,
  //               price: event.tickets.find((ticket) => ticket.id === t.ticketId)!
  //                 .price,
  //             })),
  //           },
  //         },
  //         include: {
  //           // Include ini untuk mengembalikan data yang lengkap dari transaksi yang baru dibuat
  //           transactionTickets: {
  //             include: {
  //               ticket: {
  //                 // Include ticket untuk mendapatkan namanya
  //                 select: { name: true },
  //               },
  //             },
  //           },
  //           events: {
  //             select: {
  //               title: true,
  //               slug: true,
  //               thumbnail: true,
  //               startDate: true,
  //               endDate: true,
  //               location: true,
  //             },
  //           },
  //           payments: true,
  //           user: {
  //             select: { id: true, name: true, email: true, role: true },
  //           }, // Sertakan payments jika diperlukan pada response create
  //         },
  //       });
  //       console.log("new Transaction", newTransaction);

  //       // Kurangi availableSeats untuk setiap tiket yang dibeli
  //       for (const t of dto.tickets) {
  //         await prismaTransaction.ticket.update({
  //           where: { id: t.ticketId },
  //           data: {
  //             availableSeats: {
  //               decrement: t.quantity,
  //             },
  //           },
  //         });
  //       }

  //       return newTransaction;
  //     }
  //   );

  //   return transaction;
  // };

  createTransaction = async (dto: CreateTransactionDTO, userId: number) => {
    // ambil data user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) throw new ApiError("User not found", 404);

    // ❌ Blokir jika role-nya bukan customer
    if (user.role !== "customer") {
      throw new ApiError("Only customers can create transactions", 403);
    }
    const event = await this.prisma.event.findFirst({
      where: { id: dto.eventId, deletedAt: null },
      include: { tickets: true },
    });

    if (!event) throw new ApiError("Event not found", 404);

    // Hitung total harga dan cek ketersediaan kursi
    const totalPrice = dto.tickets.reduce((acc, t) => {
      const ticket = event.tickets.find((tk) => tk.id === t.ticketId);
      if (!ticket) throw new ApiError(`Ticket ID ${t.ticketId} not found`, 404);
      if (ticket.availableSeats < t.quantity) {
        throw new ApiError(
          `Insufficient seats for ticket ID ${t.ticketId}`,
          400
        );
      }
      return acc + ticket.price * t.quantity;
    }, 0);

    const totalQuantity = dto.tickets.reduce((acc, t) => acc + t.quantity, 0);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit dari sekarang

    // Jalankan transaksi database
    const transaction = await this.prisma.$transaction(async (prismaTx) => {
      // Buat transaksi
      const newTransaction = await prismaTx.transaction.create({
        data: {
          userId,
          eventId: dto.eventId,
          quantity: totalQuantity,
          totalPrice,
          status: TransactionStatus.PENDING,
          expiresAt,
          transactionTickets: {
            create: dto.tickets.map((t) => ({
              ticketId: t.ticketId,
              quantity: t.quantity,
              price: event.tickets.find((tk) => tk.id === t.ticketId)!.price,
            })),
          },
        },
        include: {
          transactionTickets: {
            include: {
              ticket: { select: { name: true } },
            },
          },
          events: {
            select: {
              title: true,
              slug: true,
              thumbnail: true,
              startDate: true,
              endDate: true,
              location: true,
            },
          },
          payments: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Kurangi kursi yang tersedia
      for (const t of dto.tickets) {
        await prismaTx.ticket.update({
          where: { id: t.ticketId },
          data: {
            availableSeats: {
              decrement: t.quantity,
            },
          },
        });
      }

      // console.log("new Transaction", newTransaction);
      return newTransaction;
    });

    return transaction;
  };
}
