import { Prisma } from "../../generated/prisma";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PaginationQueryParams } from "../pagination/dto/pagination.dto";
import { PrismaService } from "../prisma/prisma.service";

export class PointService {
  prisma: PrismaService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
  }

  getUserPointHistory = async (
    query: PaginationQueryParams,
    authUserId: number
  ) => {
    const { page, take, sortBy, sortOrder } = query;

    const whereClause: Prisma.PointHistoryWhereInput = {
      userId: authUserId,
    };

    const data = await this.prisma.pointHistory.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take,
    });

    const count = await this.prisma.pointHistory.count({
      where: whereClause,
    });

    return {
      data,
      meta: { page, take, total: count },
    };
  };
}
