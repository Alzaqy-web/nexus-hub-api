import { PrismaClient } from "../../generated/prisma";

export class PrismaService extends PrismaClient {
  constructor() {
    super(); // ->  super untuk meneksekusi perents
  }
}

// src/modules/prisma/prisma.service.ts
// import { PrismaClient } from "../../generated/prisma";

// export class PrismaService extends PrismaClient {
//   constructor() {
//     super();

//     this.$connect();
//   }
//   // Tambahkan lifecycle hooks jika diperlukan, misal:
//   async onModuleInit() {
//     await this.$connect();
//   }

//   async onModuleDestroy() {
//     await this.$disconnect();
//   }
// }
