import { IsEmail, IsNotEmpty, IsString, IsPhoneNumber } from "class-validator";

export class CreateOrganizerDTO {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsPhoneNumber("ID")
  phone!: string;
}
