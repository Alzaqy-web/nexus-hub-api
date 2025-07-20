import { Prisma } from "../../generated/prisma";
import { ApiError } from "../../utils/api.error";
import { generateSlug } from "../../utils/generate-slug";
import { CloudinariService } from "../cloudinary/cloudinary.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDTO } from "./dto/create-event.dto";
import { GetEventDTO } from "./dto/get-event.dto";

export class EventService {
  prisma: PrismaService;
  private cloudinaryService: CloudinariService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinariService();
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

  // createEvent = async (
  //   body: CreateEventDTO,
  //   thumbnail: Express.Multer.File,
  //   authUserId: number
  // ) => {
  //   // cek
  //   const Event = await this.prisma.event.findFirst({
  //     where: { title: body.title },
  //   });

  //   if (Event) {
  //     throw new ApiError("title already in use", 400);
  //   }

  //   const slug = generateSlug(body.title);

  //   const { secure_url } = await this.cloudinaryService.upload(thumbnail);

  //   await this.prisma.event.create({
  //     data: {
  //       ...body,
  //       thumbnail: secure_url,
  //       userId: authUserId,
  //       slug,
  //     },
  //   });

  //   return { message: "create Event susscess" };
  // };

  createEvent = async (
    body: CreateEventDTO,
    thumbnail: Express.Multer.File
    // authUserId: number
  ) => {
    // cek title sudah ada atau belum
    const event = await this.prisma.event.findFirst({
      where: { title: body.title },
    });

    if (event) {
      throw new ApiError("title already in use", 400);
    }

    const slug = generateSlug(body.title);
    const { secure_url } = await this.cloudinaryService.upload(thumbnail);

    await this.prisma.event.create({
      data: {
        ...body,
        thumbnail: secure_url,
        // userId: authUserId,
        userId: 1,

        slug,
      },
    });

    return { message: "create Event success" };
  };

  deteleEvent = async (id: number, authUserId: number) => {
    const event = await this.prisma.event.findFirst({
      // cari
      where: { id, deletedAt: null },
    });
    // jika tidak ada
    if (!event) {
      throw new ApiError("event not found", 404);
    }

    if (event.userId !== authUserId) {
      throw new ApiError("unauthorized", 401);
    }

    await this.cloudinaryService.remove(event.thumbnail);

    await this.prisma.event.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: "delelte event sucssec" };
  };
}
