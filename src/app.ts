import cors from "cors";
import express, { Express, json } from "express";
import "reflect-metadata";
import { PORT } from "./config/env";
import { AuthRouter } from "./modules/auth/auth.router";
import { SampleRouter } from "./modules/sample/sample.router";
import { EventRouter } from "./modules/event/event.router";
import { TicketRouter } from "./modules/ticket/ticket.router";
import { TransactionRouter } from "./modules/transaction/transaction.router";
import { errorMiddleware } from "./middleware/error.middlware";
import { PaymentRouter } from "./modules/payment/payment.router";
import { ProfileRouter } from "./modules/profile/profile.router";
import { ProfileService } from "./modules/profile/profile.service";
import { ProfileController } from "./modules/profile/profile.controller";
import { JwtMiddleware } from "./middleware/jwt.middleware";
import { UploaderMiddleware } from "./middleware/uploader.middleware";
import { PrismaClient } from "@prisma/client";
import { CloudinaryService } from "./modules/cloudinary/cloudinary.service";
import { PrismaService } from "./modules/prisma/prisma.service";
import { PointRouter } from "./modules/point/point.router";
import { DiscountRouter } from "./modules/discount/discount.router";

export class App {
  app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure() {
    this.app.use(cors());
    this.app.use(json());
  }

  private routes() {
    const sampleRouter = new SampleRouter();
    const authRouter = new AuthRouter();

    const prisma = new PrismaService();
    // const cloudinaryService = new CloudinaryService();

    const profileService = new ProfileService(prisma, new CloudinaryService());
    const profileController = new ProfileController(profileService);
    const jwtMiddleware = new JwtMiddleware();
    const uploaderMiddleware = new UploaderMiddleware();
    const profileRouter = new ProfileRouter(
      profileController,
      jwtMiddleware,
      uploaderMiddleware
    );

    const eventRouter = new EventRouter();
    const ticketRouter = new TicketRouter();
    const transactionRouter = new TransactionRouter();
    const paymentRouter = new PaymentRouter();
    const pointRouter = new PointRouter();
    const discountRouter = new DiscountRouter();

    this.app.use("/samples", sampleRouter.getRouter());
    this.app.use("/auth", authRouter.getRouter());
    this.app.use("/profile", profileRouter.getRouter());
    this.app.use("/events", eventRouter.getRouter());
    this.app.use("/tickets", ticketRouter.getRouter());
    this.app.use("/transactions", transactionRouter.getRouter());
    this.app.use("/payments", paymentRouter.getRouter());
    this.app.use("/point", pointRouter.getRouter());
    this.app.use("/discount", discountRouter.getRouter());
  }

  private handleError() {
    this.app.use(errorMiddleware);
  }

  public start() {
    this.app.listen(PORT, () => {
      console.log(`Server running on PORT : ${PORT}`);
    });
  }
}
