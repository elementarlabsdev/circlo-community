import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class SetUserPasswordUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, newPassword: string): Promise<void> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
