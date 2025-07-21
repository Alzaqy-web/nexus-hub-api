import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  IsOptional,
  IsIn,
} from "class-validator";

export class RegisterDTO {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password!: string;

  @IsOptional()
  @IsIn(["customer", "EO"])
  role?: "customer" | "EO";

  @IsOptional()
  @IsString()
  referredBy?: string;
}
