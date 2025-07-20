import { JWT_SECRET } from "../../config/env";
import { User } from "../../generated/prisma";
import { ApiError } from "../../utils/api.error";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDTO } from "./dto/register.dto";
import { PasswordService } from "./password.service";
import { tokenService } from "./token.service";
import { MailService } from "../mail/mail.service";

export class AuthService {
  private prisma: PrismaService;
  private passwordService: PasswordService;
  private tokenService: tokenService;
  private mailService: MailService;

  constructor() {
    this.prisma = new PrismaService();
    this.passwordService = new PasswordService();
    this.tokenService = new tokenService();
    this.mailService = new MailService();
  }
  login = async (body: Pick<User, "email" | "password">) => {
    // cek dulu email ada gak di db
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    // kalau gak ada thorw error
    if (!user) {
      throw new ApiError("email not found", 400);
    }

    // kalo ada cek passsword valod or tidak
    const isPasswordValid = await this.passwordService.comparePassword(
      body.password,
      user.password
    );

    // kalo tidak valit thorw error
    if (!isPasswordValid) {
      throw new ApiError("invalid password", 400);
    }

    // kalo valid generate access token mengunakan jwt
    const accessToken = this.tokenService.generateToken(
      {
        id: user.id,
      },
      JWT_SECRET!
    );

    const { password, ...userWhithoutPassword } = user;

    // return data user berserta tokennya
    return { ...userWhithoutPassword, accessToken };
  };

  register = async (body: RegisterDTO) => {
    const existingEmail = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (existingEmail) {
      throw new ApiError("email already exist!", 400);
    }

    const hashedPassword = await this.passwordService.hashPassword(
      body.password
    );

    const newUser = await this.prisma.user.create({
      data: { ...body, password: hashedPassword },
      omit: { password: true },
    });

    await this.mailService.sendEmail(
      body.email,
      "Welcome to BlogHub",
      "welcome",
      { name: body.name }
    );

    return newUser;
  };
}
