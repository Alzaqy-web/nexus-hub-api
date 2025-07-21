import { IsNotEmpty, IsString, IsInt, IsUrl } from "class-validator";

export class CreatePaymentDTO {
  @IsNotEmpty()
  @IsInt()
  transactionId!: number;

  @IsNotEmpty()
  @IsString()
  method!: string;

  @IsNotEmpty()
  @IsString()
  reference!: string;

  @IsNotEmpty()
  @IsInt()
  amountPaid!: number;

  @IsNotEmpty()
  @IsUrl()
  proofUrl!: string;
}
