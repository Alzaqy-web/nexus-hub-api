import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class CreateTicketDTO {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  type!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  price!: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  availableSeats!: number;

  @IsNotEmpty()
  @IsInt()
  eventId!: number;
}
