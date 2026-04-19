import { ConflictException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { AdminUpdateUserDto } from '@/platform/application/dtos/admin-update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminUpdateUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: AdminUpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');

    // Guard: super admin cannot be blocked
    if (existing.isSuperAdmin && dto.isBlocked === true) {
      throw new ForbiddenException('Super admin cannot be blocked');
    }

    // Uniqueness checks
    if (dto.email) {
      const found = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (found && found.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }
    if (dto.username) {
      const found = await this.prisma.user.findUnique({ where: { username: dto.username } });
      if (found && found.id !== id) {
        throw new ConflictException('Username already in use');
      }
    }

    const data: any = {
      updatedAt: new Date(),
    };

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.username !== undefined) data.username = dto.username;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.roleId !== undefined) data.roleId = dto.roleId;
    if (dto.isBlocked !== undefined) data.isBlocked = dto.isBlocked;
    if (dto.verified !== undefined) data.verified = dto.verified;
    if (dto.isSuperAdmin !== undefined) data.isSuperAdmin = dto.isSuperAdmin;
    if (dto.cookieConsent !== undefined) data.cookieConsent = dto.cookieConsent;
    if (dto.cookiePreferences !== undefined) data.cookiePreferences = dto.cookiePreferences;

    if (dto.password) {
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(dto.password, salt);
    }

    await this.prisma.user.update({ where: { id }, data });
    return { id };
  }
}
