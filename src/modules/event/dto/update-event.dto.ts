import { IsDate, IsOptional, IsString } from "class-validator";

export class UpdateEventDTO {
  @IsOptional()
  @IsString()
  readonly title?: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsString()
  readonly content?: string;

  @IsOptional()
  @IsString()
  readonly category?: string;

  @IsOptional()
  @IsString()
  readonly location?: string;

  @IsOptional()
  @IsDate()
  readonly startDate?: Date;

  @IsOptional()
  @IsDate()
  readonly endDate?: Date;
}
