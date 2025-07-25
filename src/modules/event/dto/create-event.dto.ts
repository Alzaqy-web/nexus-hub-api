import { Transform, Type } from "class-transformer";
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from "class-validator";
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

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  type!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  price!: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  availableSeats!: number;
}
