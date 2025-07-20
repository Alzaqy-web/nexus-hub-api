import { IsOptional, IsString } from "class-validator";

export class GetTicketDTO {
  @IsOptional()
  @IsString()
  search?: string;
}
