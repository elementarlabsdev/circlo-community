import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class GetEmailByHashUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(hash: string): Promise<{ email: string }> {
    const emailVerification =
      await this.prisma.emailVerification.findUnique({
        where: { hash },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });

    if (!emailVerification) {
      throw new NotFoundException('Verification not found');
    }

    return {
      email: emailVerification.user.email,
    };
  }
}
