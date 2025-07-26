import { ApiError } from "../../utils/api-error";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateProfileDTO } from "./dto/update-profile.dto";

export class ProfileService {
  private prisma: PrismaService;
  private cloudinaryService: CloudinaryService;

  constructor(
    private PrismaClient: PrismaService,
    private CloudinaryService: CloudinaryService
  ) {
    this.prisma = PrismaClient;
    this.cloudinaryService = CloudinaryService;
  }

  getProfileById = async (id: number) => {
    const user = await this.prisma.user.findFirst({
      where: { id },
    });

    if (!user) {
      throw new ApiError("Invalid user id", 400);
    }
    return user;
  };

  updateProfile = async (
    id: number,
    body: UpdateProfileDTO,
    authUserId: number,
    profilePic?: Express.Multer.File
  ) => {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      console.log("❌ User not found with id:", id);
      throw new ApiError("Invalid user id", 400);
    }

    if (user.id !== authUserId) {
      console.log("⚠️ Forbidden update attempt:", {
        userId: user.id,
        authUserId,
      });
      throw new ApiError("Forbidden", 403);
    }

    if (body.email && body.email !== user.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email: body.email },
      });
      if (existingEmail) {
        throw new ApiError("Email already exists", 400);
      }
    }

    if (body.name && body.name !== user.name) {
      const existingName = await this.prisma.user.findFirst({
        where: { name: body.name },
      });

      if (existingName) {
        throw new ApiError("Name already exists", 400);
      }
    }

    let newProfilePic = user.profilePic;

    if (profilePic) {
      if (user.profilePic) {
        await this.cloudinaryService.remove(user.profilePic as string);
      }
      const { secure_url } = await this.cloudinaryService.upload(profilePic);
      newProfilePic = secure_url;
    }

    return await this.prisma.user.update({
      where: { id },
      data: { ...body, profilePic: newProfilePic },
    });
  };
}
