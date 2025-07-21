import cors from "cors";
import express, { Express } from "express";
import "reflect-metadata";
import { PORT } from "./config/env";
import { AuthRouter } from "./modules/auth/auth.router";
import { SampleRouter } from "./modules/sample/sample.router";
import { EventRouter } from "./modules/event/event.router";
import { TicketRouter } from "./modules/ticket/ticket.router";
import { TransactionRouter } from "./modules/transaction/transaction.router";
// import { ProfileRouter } from "./modules/profile/profile.router";
import { errorMiddleware } from "./middleware/error.middlware";
import { PaymentRouter } from "./modules/payment/payment.router";

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
    this.app.use(express.json()); // Supaya bisa nerima request body
  }

  private routes() {
    const sampleRouter = new SampleRouter();
    const authRouter = new AuthRouter();
    // const profileRouter = new ProfileRouter();
    const eventRouter = new EventRouter();
    const ticketRouter = new TicketRouter();
    const transactionRouter = new TransactionRouter();
    const paymentRouter = new PaymentRouter();

    this.app.use("/samples", sampleRouter.getRouter());
    this.app.use("/auth", authRouter.getRouter());
    // this.app.use("/profile", profileRouter.getRouter());
    this.app.use("/events", eventRouter.getRouter());
    this.app.use("/tickets", ticketRouter.getRouter());
    this.app.use("/transactions", transactionRouter.getRouter());
    this.app.use("/payments", paymentRouter.getRouter());
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
