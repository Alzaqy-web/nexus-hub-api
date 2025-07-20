import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { PaginationQueryParams } from "../../../pagination/dto/pagination.dto";

export class CreateEventDTO extends PaginationQueryParams {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsString()
  content!: string;

  @IsNotEmpty()
  @IsString()
  category!: string;

  @IsNotEmpty()
  @IsString()
  location!: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate!: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate!: Date;
}
