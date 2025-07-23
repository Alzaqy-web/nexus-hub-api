import { ApiError } from "../../utils/api-error";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PrismaService } from "../prisma/prisma.service";

export class AttendeeService {
  private prisma: PrismaService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
  }

  getAttendeeBySlug = async (slug: string) => {
    const attendee = await this.prisma.event.findFirst({
      where: { slug: slug, deletedAt: null },
      include: { user: { omit: { password: true } }, transactions: true },
    });

    if (!attendee) {
      throw new ApiError("Event not found", 404);
    }

    return attendee;
  };
}
