import { IsInt, IsNotEmpty } from "class-validator";

export class CreateTransactionDTO {
  @IsNotEmpty()
  @IsInt()
  eventId!: number;

  @IsNotEmpty()
  @IsInt()
  quantity!: number;
}
