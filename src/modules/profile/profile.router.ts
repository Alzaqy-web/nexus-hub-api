import { Router } from "express";
import { ProfileController } from "./profile.controller";
import { JwtMiddleware } from "../../middleware/jwt.middleware";
import { UploaderMiddleware } from "../../middleware/uploader.middleware";
import { JWT_SECRET } from "../../config/env";
import { validateBody } from "../../middleware/validation.middleware";
import { UpdateProfileDTO } from "./dto/update-profile.dto";

export class ProfileRouter {
  private router: Router;
  private profileController: ProfileController;
  private jwtMiddleware: JwtMiddleware;
  private uploaderMiddleware: UploaderMiddleware;

  constructor(
    ProfileController: ProfileController,
    JwtMiddleware: JwtMiddleware,
    UploaderMiddleware: UploaderMiddleware
  ) {
    this.router = Router();
    this.profileController = ProfileController;
    this.jwtMiddleware = JwtMiddleware;
    this.uploaderMiddleware = UploaderMiddleware;
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get(
      "/:id",
      this.jwtMiddleware.verifyToken(JWT_SECRET!),
      this.profileController.getProfileById
    );

    this.router.patch(
      "/:id",
      this.jwtMiddleware.verifyToken(JWT_SECRET!),
      this.uploaderMiddleware
        .getUploader()
        .fields([{ name: "profilePic", maxCount: 1 }]),
      this.uploaderMiddleware.fileFilter([
        "image/jpeg",
        "image/png",
        "image/avif",
        "image/webp",
      ]),
      validateBody(UpdateProfileDTO),
      this.profileController.updateProfile
    );
  };

  getRouter() {
    return this.router;
  }
}
