import express, { Express } from "express";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.middlwares";
import { PORT } from "./config/env";
import { SampleRouter } from "./modules/sample/sample.router";

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

    this.app.use("/samples", sampleRouter.getRouter());
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
