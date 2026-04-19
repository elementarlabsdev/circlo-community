import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { MyProfileDto } from '@/account/application/dtos/my-profile.dto';

@Injectable()
export class SaveMyProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, dto: MyProfileDto): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }
}
