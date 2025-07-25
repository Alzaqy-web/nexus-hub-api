import { Prisma } from "../../generated/prisma";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PaginationQueryParams } from "../pagination/dto/pagination.dto";
import { PrismaService } from "../prisma/prisma.service";

export class DiscountService {
  prisma: PrismaService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
  }

  getUserDiscountHistory = async (
    query: PaginationQueryParams,
    authUserId: number
  ) => {
    const { page, take, sortBy, sortOrder } = query;

    const whereClause: Prisma.CustomerDiscountWhereInput = {
      userId: authUserId,
    };

    const data = await this.prisma.customerDiscount.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take,
    });

    const count = await this.prisma.customerDiscount.count({
      where: whereClause,
    });

    return {
      data,
      meta: { page, take, total: count },
    };
  };
}
