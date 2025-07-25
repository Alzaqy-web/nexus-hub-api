import { NextFunction, Request, Response } from "express";
import { ProfileService } from "./profile.service";

export class ProfileController {
  private profileService: ProfileService;

  constructor(ProfileService: ProfileService) {
    this.profileService = ProfileService;
  }
  getProfileById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const result = await this.profileService.getProfileById(id);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("DEBUG UPDATE PROFILE >>>");
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const profilePic = files?.profilePic?.[0];
      const result = await this.profileService.updateProfile(
        Number(req.params.id),
        req.body,
        res.locals.user.id,
        profilePic
      );
      res.status(200).send(result);
    } catch (error) {
      console.log("ERROR UPDATE:", error);
      next(error);
    }
  };
}
