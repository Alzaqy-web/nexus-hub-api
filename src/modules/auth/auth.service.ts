import { PrismaService } from "../prisma/prisma.service";
import { User } from "../../generated/prisma";
import { ApiError } from "../../utils/api-error";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { JWT_SECRET } from "../../config/env";
import { RegisterDTO } from "./dto/register.dto";
import { MailService } from "../mail/mail.service";
import { customAlphabet, nanoid } from "nanoid";

export class AuthService {
  private prisma: PrismaService;
  private passwordService: PasswordService;
  private tokenService: TokenService;
  private mailService: MailService;

  constructor() {
    this.prisma = new PrismaService();
    this.passwordService = new PasswordService();
    this.tokenService = new TokenService();
    this.mailService = new MailService();
  }

  login = async (body: Pick<User, "email" | "password">) => {
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (!user) {
      throw new ApiError("email not found", 404);
    }

    const isPasswordValid = await this.passwordService.comparedPassword(
      body.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new ApiError("invalid password", 404);
    }

    const accessToken = this.tokenService.generateToken(
      {
        id: user.id,
      },
      JWT_SECRET!
    );

    const { password, ...userWithoutPassword } = user;

    return { ...userWithoutPassword, accessToken };
  };

  nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);

  generateUniqueReferralCode = async (
    prisma: PrismaService
  ): Promise<string> => {
    let code = "";
    let exists = true;

    while (exists) {
      code = this.nanoid();
      const user = await prisma.user.findUnique({
        where: { referralCode: code },
      });
      exists = !!user;
    }
    return code;
  };

  register = async (body: RegisterDTO) => {
    const existingEmail = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (existingEmail) {
      throw new ApiError("Email already exist", 400);
    }

    const hashedPassword = await this.passwordService.hashPassword(
      body.password
    );

    let validReferralCode: string | null = null;
    if (body.referredBy) {
      const refUser = await this.prisma.user.findFirst({
        where: { referralCode: body.referredBy.toUpperCase() },
      });

      if (!refUser) {
        throw new ApiError("Referral code not found", 400);
      }

      validReferralCode = refUser.referralCode;
    }

    const referralCode = await this.generateUniqueReferralCode(this.prisma);

    const newUser = await this.prisma.user.create({
      data: {
        ...body,
        password: hashedPassword,
        referralCode,
        referredBy: validReferralCode,
      },
      omit: { password: true },
    });

    if (validReferralCode) {
      const referralPoints = 10000;
      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(now.getDate() + 90);
      const discountExpiry = new Date();
      discountExpiry.setMonth(discountExpiry.getMonth() + 3);

      await this.prisma.customerDiscount.create({
        data: {
          userId: newUser.id,
          discount: 15,
          used: false,
          expiresAt: discountExpiry,
        },
      });

      const refUser = await this.prisma.user.findFirst({
        where: { referralCode: validReferralCode },
      });

      if (refUser) {
        await this.prisma.pointHistory.create({
          data: {
            userId: refUser.id,
            amount: referralPoints,
            createdAt: now,
            expiresAt,
          },
        });

        await this.prisma.user.update({
          where: { id: refUser.id },
          data: { points: { increment: referralPoints } },
        });
      }
    }

    await this.mailService.sendEmail(
      body.email,
      "Welcome to BlogHub",
      "welcoming",
      { name: body.name }
    );

    return newUser;
  };

  registerAdmin = async (body: RegisterDTO) => {
    const existingEmail = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (existingEmail) {
      throw new ApiError("Email already exist", 400);
    }

    const hashedPassword = await this.passwordService.hashPassword(
      body.password
    );

    const newAdmin = await this.prisma.user.create({
      data: { ...body, password: hashedPassword, role: "EO" },
      omit: { password: true },
    });

    await this.mailService.sendEmail(
      body.email,
      "Welcome to BlogHub",
      "welcoming",
      { name: body.name }
    );

    return newAdmin;
  };
}
