import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateProfileDTO {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsOptional()
  @IsString()
  readonly password?: string;
}
