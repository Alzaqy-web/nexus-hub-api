import { Prisma } from "../../generated/prisma";
import { ApiError } from "../../utils/api-error";
import { generateSlug } from "../../utils/generate-slug";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PaginationQueryParams } from "../pagination/dto/pagination.dto";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDTO } from "./dto/create-event.dto";
import { UpdateEventDTO } from "./dto/update-event.dto";

export class EventService {
  prisma: PrismaService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
  }

  getEvents = async (query: PaginationQueryParams) => {
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

  updateEvent = async (
    slug: string,
    body: UpdateEventDTO,
    authUserId: number,
    thumbnail?: Express.Multer.File
  ) => {
    const event = await this.prisma.event.findFirst({
      where: { slug },
    });

    if (!event) {
      throw new ApiError("event not found", 404);
    }

    if (event.userId !== authUserId) {
      throw new ApiError("You are not allowed to update this event", 403);
    }

    let newSlug = event.slug;

    if (body.title && body.title !== event.title) {
      const eventTitle = await this.prisma.event.findFirst({
        where: { title: body.title, NOT: { id: event.id } },
      });

      if (eventTitle) {
        throw new ApiError("title already in use", 400);
      }

      newSlug = generateSlug(body.title);
    }

    let newThumbnail = event.thumbnail;

    if (thumbnail) {
      if (event.thumbnail) {
        await this.cloudinaryService.remove(event.thumbnail);
      }

      const { secure_url } = await this.cloudinaryService.upload(thumbnail);
      newThumbnail = secure_url;
    }

    return await this.prisma.event.update({
      where: { slug },
      data: {
        ...body,
        slug: newSlug,
        thumbnail: newThumbnail,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
    });
  };
}
