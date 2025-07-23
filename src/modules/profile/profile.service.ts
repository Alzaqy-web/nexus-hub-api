import { PrismaClient } from "../../generated/prisma";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { UploadApiResponse } from "cloudinary";
import { PasswordService } from "../auth/password.service";

export class ProfileService {
  constructor(
    private prisma: PrismaClient,
    private cloudinary: CloudinaryService,
    private passwordService: PasswordService
  ) {}

  async uploadProfilePicture(
    file: Express.Multer.File,
    userId: number
  ): Promise<string> {
    const uploadResult: UploadApiResponse = await this.cloudinary.upload(file);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { profilePic: uploadResult.secure_url },
    });

    return updatedUser.profilePic!;
  }

  async updateProfile(
    userId: number,
    data: { name?: string; email?: string; password?: string }
  ): Promise<void> {
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;

    if (data.password) {
      updateData.password = await this.passwordService.hashPassword(
        data.password
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
}
