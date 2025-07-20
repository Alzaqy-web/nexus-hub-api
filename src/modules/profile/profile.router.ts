import { Router } from "express";
import profileController from "./profile.controller";
import { UploaderMiddleware } from "../../middleware/uploader.middleware";
import { JwtMiddleware } from "../../middleware/jwt.middleware"; // ✅ Pastikan import ini
import { asyncHandler } from "../../utils/asyncHandler";

export class ProfileRouter {
  private router: Router;

  constructor() {
    this.router = Router();

    const uploader = new UploaderMiddleware();
    const upload = uploader.getUploader(); // ✅ Pake getter method
    const fileFilter = uploader.fileFilter([
      "image/png",
      "image/jpeg",
      "image/webp",
    ]);
    const jwt = new JwtMiddleware();

    this.router.post(
      "/upload",
      jwt.verifyToken(process.env.JWT_SECRET!), // ⬅️ Ambil user dari token
      upload.single("profilePic"),
      fileFilter,
      asyncHandler(profileController.upload)
    );

    this.router.put(
      "/",
      jwt.verifyToken(process.env.JWT_SECRET!),
      asyncHandler(profileController.update)
    );
  }

  public getRouter() {
    return this.router;
  }
}
