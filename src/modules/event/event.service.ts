import { Prisma } from "../../generated/prisma";
import { ApiError } from "../../utils/api-error";
import { generateSlug } from "../../utils/generate-slug";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDTO } from "./dto/create-event.dto";
import { GetEventDTO } from "./dto/get-event.dto";

export class EventService {
  prisma: PrismaService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
  }

  getEvents = async (query: GetEventDTO) => {
    const { page, take, sortBy, sortOrder, search } = query;

    const whereClause: Prisma.EventWhereInput = {
      deletedAt: null,
    };

    if (search) {
      whereClause.title = { contains: search, mode: "insensitive" };
    }

    const events = await this.prisma.event.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take: take,
      include: { user: { omit: { password: true } }, tickets: true },
    });

    const count = await this.prisma.event.count({ where: whereClause });

    return {
      data: events,
      meta: { page, take, total: count },
    };
  };

  getEventBySlug = async (slug: string) => {
    const event = await this.prisma.event.findFirst({
      where: { slug, deletedAt: null },
      include: { user: { omit: { password: true } }, tickets: true }, //-> inculde -> join
    });

    if (!event) {
      throw new ApiError("event not found", 404);
    }

    return event;
  };

  // test
  createEvent = async (
    body: CreateEventDTO,
    thumbnail: Express.Multer.File,
    authUserId: number,
    authUserRole: string // tambahkan parameter role

  ) => {
    // Cek role dulu
    if (authUserRole !== "EO") {
      throw new ApiError("Only EO role can create events", 403);
    }
    // cek title sudah ada atau belum
    const event = await this.prisma.event.findFirst({
      where: { title: body.title },
    });
    if (event) {
      throw new ApiError("title already in use", 400);
    }

    const slug = generateSlug(body.title);
    const { secure_url } = await this.cloudinaryService.upload(thumbnail);
    // join 2 table
    const newEvent = await this.prisma.event.create({
      data: {
        content: body.content,
        category: body.category,
        location: body.location,
        startDate: body.startDate,
        endDate: body.endDate,
        description: body.description,
        title: body.title,
        thumbnail: secure_url,
        userId: authUserId,
        slug,
      },
    });

    await this.prisma.ticket.create({
      data: {
        eventId: newEvent.id,
        price: Number(body.price),
        name: body.name,
        availableSeats: Number(body.availableSeats),
        type: body.type,
        userId: authUserId,
      },
    });
    return { message: "create Event success" };
  };

  // deteleEvent = async (id: number, authUserId: number) => {
  //   const event = await this.prisma.event.findFirst({
  //     // cari
  //     where: { id, deletedAt: null },
  //   });
  //   // jika tidak ada
  //   if (!event) {
  //     throw new ApiError("event not found", 404);
  //   }

  //   if (event.userId !== authUserId) {
  //     throw new ApiError("unauthorized", 401);
  //   }

  //   await this.cloudinaryService.remove(event.thumbnail);

  //   await this.prisma.event.update({
  //     where: { id },
  //     data: { deletedAt: new Date() },
  //   });

  //   return { message: "delelte event sucssec" };
  // };
}
