import {
  IsInt,
  IsNotEmpty,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";

class TicketOrderDTO {
  @IsNotEmpty()
  @IsInt()
  ticketId!: number;

  @IsNotEmpty()
  @IsInt()
  quantity!: number;
}

export class CreateTransactionDTO {
  @IsNotEmpty()
  @IsInt()
  eventId!: number;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => TicketOrderDTO)
  tickets!: TicketOrderDTO[];
}
