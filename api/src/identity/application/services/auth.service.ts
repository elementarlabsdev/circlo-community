import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { EmailVerification } from '@prisma/client';
import { User } from '@/identity/domain/entities/user.entity';
import { UsersService } from '@/identity/application/services/users.service';
import { LoginDto } from '@/identity/application/dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private _usersService: UsersService,
    private _jwtService: JwtService,
    private _prisma: PrismaService,
  ) {}

  async login(
    loginDto: LoginDto,
  ): Promise<{ authToken: string; user: any } | null> {
    const user = await this._validateUser(loginDto);

    if (!user) {
      return null;
    }

    const userData = user.toPrimitives();

    const monetizationPaidAccountEnabled =
      await this._prisma.setting.findFirst({
        where: { name: 'monetizationPaidAccountEnabled' },
      });

    const purchase = await this._prisma.purchase.findFirst({
      where: {
        userId: userData.id,
        status: 'completed',
        publicationId: null,
        tutorialId: null,
      },
    });

    const isPaid =
      user.role?.type === 'admin' ||
      userData.isSuperAdmin ||
      userData.hasPaidAccount ||
      !!purchase;
    const isPaidAccountRequired =
      (monetizationPaidAccountEnabled?.data as any) === 'true' ||
      (monetizationPaidAccountEnabled?.data as any) === true;

    const payload = { email: user.email.value, id: userData.id };

    // Auto-reactivate deactivated users on successful login
    if (userData.isDeactivated) {
      await this._prisma.user.update({
        where: { id: userData.id },
        data: { isDeactivated: false, lastActivityAt: new Date() },
      });
      // reflect change in returned user object
      (userData as any).isDeactivated = false;
    } else {
      await this._prisma.user.update({
        where: {
          id: userData.id,
        },
        data: {
          lastActivityAt: new Date(),
        },
      });
    }

    return {
      authToken: await this._jwtService.signAsync(payload),
      user: {
        ...userData,
        isPaid: isPaidAccountRequired ? isPaid : true,
      },
    };
  }

  async loginByOAuth(user: User) {
    const userData = user.toPrimitives();

    const monetizationPaidAccountEnabled =
      await this._prisma.setting.findFirst({
        where: { name: 'monetizationPaidAccountEnabled' },
      });

    const purchase = await this._prisma.purchase.findFirst({
      where: {
        userId: userData.id,
        status: 'completed',
        publicationId: null,
        tutorialId: null,
      },
    });

    const isPaid =
      user.role?.type === 'admin' ||
      userData.isSuperAdmin ||
      userData.hasPaidAccount ||
      !!purchase;
    const isPaidAccountRequired =
      (monetizationPaidAccountEnabled?.data as any) === 'true' ||
      (monetizationPaidAccountEnabled?.data as any) === true;

    const payload = { email: user.email.value, id: userData.id };
    await this._prisma.user.update({
      where: {
        id: userData.id,
      },
      data: {
        lastActivityAt: new Date(),
      },
    });

    return {
      authToken: await this._jwtService.signAsync(payload),
      user: {
        ...userData,
        isPaid: isPaidAccountRequired ? isPaid : true,
      },
    };
  }

  async logout(): Promise<void> {}

  async findEmailVerification(user: User): Promise<EmailVerification> {
    return this._prisma.emailVerification.findUnique({
      where: {
        userId: user.id,
      },
    });
  }

  private async comparePassword(enteredPassword: string, dbPassword: string) {
    return await bcrypt.compare(enteredPassword, dbPassword);
  }

  private async _validateUser(loginDto: LoginDto) {
    const user = await this._usersService.findOneByEmail(loginDto.email);

    if (!user) {
      return null;
    }

    const match = await this.comparePassword(loginDto.password, user.passwordHash);

    if (!match) {
      return null;
    }

    return user;
  }
}
