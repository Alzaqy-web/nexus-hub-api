import { ApiError } from "../../utils/api.error";
import { PrismaService } from "../prisma/prisma.service";

export class SampleService {
  prisma: PrismaService;

  constructor() {
    this.prisma = new PrismaService();
  }
  // GET -> banyak data
  getSamples = async () => {
    const samples = await this.prisma.sample.findMany();
    return samples;
  };

  // GET -> banyak data\
  getSample = async (id: number) => {
    const sample = await this.prisma.sample.findFirst({
      where: { id: id },
    });
    if (!sample) {
      throw new ApiError("sample not found", 400);
    }
    return sample;
  };
}
