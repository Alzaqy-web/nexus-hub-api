import cors from "cors";
import express, { Express } from "express";
import "reflect-metadata";
import { PORT } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middlwares";
import { AuthRouter } from "./modules/auth/auth.router";
import { SampleRouter } from "./modules/sample/sample.router";
import { EventRouter } from "./modules/event/event.router";
import { TicketRouter } from "./modules/ticket/ticket.router";
import { TransactionRouter } from "./modules/transaction/transaction.router";

export class App {
  app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  // 1. setup -> private hanya untuk 1 class

  private configure() {
    this.app.use(cors());
    this.app.use(express.json()); // -> supaya bisa menerima red body
  }

  // 2.routes()
  private routes() {
    const sampleRouter = new SampleRouter();
    const authRouter = new AuthRouter();
    const eventRouter = new EventRouter();
    const ticketRouter = new TicketRouter();
    const transactionRouter = new TransactionRouter();

    this.app.use("/samples", sampleRouter.getRouter());
    this.app.use("/auth", authRouter.getRouter());
    this.app.use("/events", eventRouter.getRouter());
    this.app.use("/tickets", ticketRouter.getRouter());
    this.app.use("/transactions", transactionRouter.getRouter());
  }

  //
  private handleError() {
    this.app.use(errorMiddleware);
  }

  // -> public methodsp
  public start() {
    this.app.listen(PORT, () => {
      console.log(`Server running on PORT : ${PORT}`);
    });
  }
}
