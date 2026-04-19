import { Injectable, BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/platform/application/services/prisma.service';

export interface ChangePasswordCommand {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const { userId, currentPassword, newPassword } = command;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    } as any);
    if (!user) {
      return; // silently succeed as before
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestException(
        await this.i18n.t('common.errors.invalid_current_password'),
      );
    }

    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isSameAsCurrent) {
      throw new BadRequestException(
        await this.i18n.t('common.errors.new_password_same_as_current'),
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newHash },
    });
  }
}
