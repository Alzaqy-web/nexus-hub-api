import { Prisma } from "../../generated/prisma";
import { ApiError } from "../../utils/api-error";
import { generateSlug } from "../../utils/generate-slug";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PaginationQueryParams } from "../pagination/dto/pagination.dto";
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

  getEvents = async (query: PaginationQueryParams, authUserId: number) => {
    const { page, take, sortBy, sortOrder } = query;

    const whereClause: Prisma.EventWhereInput = {
      deletedAt: null,
    };

    const events = await this.prisma.event.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take: take,
      include: { tickets: true },
    });

    const count = await this.prisma.event.count({ where: whereClause });

    return {
      data: events,
      meta: { page, take, total: count },
    };
  };

  getAdminEvents = async (query: PaginationQueryParams, authUserId: number) => {
    const { page, take, sortBy, sortOrder } = query;

    const whereClause: Prisma.EventWhereInput = {
      userId: authUserId,
    };

    const events = await this.prisma.event.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take: take,
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
      include: { user: { omit: { password: true } } },
    });

    if (!event) {
      throw new ApiError("event not found", 404);
    }

    return event;
  };

  createEvent = async (
    body: CreateEventDTO,
    thumbnail: Express.Multer.File,
    authUserId: number
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
        userId: authUserId,
        slug,
      },
    });

    return { message: "create Event success" };
  };
}
