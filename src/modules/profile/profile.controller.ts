import { Request, Response } from "express";
import { ProfileService } from "./profile.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PrismaClient } from "../../generated/prisma";
import { PasswordService } from "../auth/password.service";

const prisma = new PrismaClient();
const profileService = new ProfileService(
  prisma,
  new CloudinaryService(),
  new PasswordService()
);

const profileController = {
  upload: async (req: Request, res: Response) => {
    try {
      const file = req.file;

      const userId = req.user?.id; // ✅ ambil dari token

      console.log(file?.originalname, file?.mimetype, file?.size);

      if (!file || !userId) {
        return res.status(400).json({ message: "File or userId missing" });
      }

      const imageUrl = await profileService.uploadProfilePicture(file, userId);

      return res.status(200).json({ imageUrl });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Upload failed", error });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { name, email, password } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "Unauthorized" });
      }

      if (!name && !email && !password) {
        return res.status(400).json({ message: "No data to update" });
      }

      await profileService.updateProfile(userId, { name, email, password });

      return res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Update failed", error });
    }
  },
};

export default profileController;
