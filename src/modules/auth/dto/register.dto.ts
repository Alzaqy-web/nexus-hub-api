// -> INI UNTUK VALIDASAI DATA

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
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
}
