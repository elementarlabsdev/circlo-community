import { Injectable, ForbiddenException } from '@nestjs/common';
import { Role } from '../../domain/entities/role.entity';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { RoleRepositoryInterface } from '@/identity/domain/repositories/role-repository.interface';

@Injectable()
export class RoleRepository implements RoleRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Role[]> {
    const rolesFromDb = await this.prisma.role.findMany({
      include: { permissions: true },
    });

    return rolesFromDb.map(
      (roleFromDb) =>
        new Role(
          roleFromDb.id,
          roleFromDb.type,
          roleFromDb.name,
          roleFromDb.isBuiltIn,
          roleFromDb.permissions as any[],
          roleFromDb.parentId,
        ),
    );
  }

  async findById(id: string): Promise<Role | null> {
    const roleFromDb = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!roleFromDb) {
      return null;
    }

    return new Role(
      roleFromDb.id,
      roleFromDb.type,
      roleFromDb.name,
      roleFromDb.isBuiltIn,
      roleFromDb.permissions as any[],
      roleFromDb.parentId,
    );
  }

  async findByType(type: string): Promise<Role | null> {
    const roleFromDb = await this.prisma.role.findUnique({
      where: { type },
      include: { permissions: true },
    });

    if (!roleFromDb) {
      return null;
    }

    return new Role(
      roleFromDb.id,
      roleFromDb.type,
      roleFromDb.name,
      roleFromDb.isBuiltIn,
      roleFromDb.permissions as any[],
      roleFromDb.parentId,
    );
  }

  async create(data: { name: string; type: string; permissions?: any[]; parentId?: string | null }): Promise<Role> {
    const roleFromDb = await this.prisma.role.create({
      data: {
        name: data.name,
        type: data.type,
        permissions: {
          create: data.permissions || [],
        },
        parentId: data.parentId,
      },
      include: { permissions: true },
    });

    return new Role(
      roleFromDb.id,
      roleFromDb.type,
      roleFromDb.name,
      roleFromDb.isBuiltIn,
      roleFromDb.permissions as any[],
      roleFromDb.parentId,
    );
  }

  async update(id: string, data: { name?: string; type?: string; permissions?: any[]; parentId?: string | null }): Promise<Role> {
    const existingRole = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      throw new ForbiddenException('Role not found');
    }

    if (existingRole.isBuiltIn && data.type && data.type !== existingRole.type) {
      throw new ForbiddenException('Cannot change type of built-in role');
    }

    const roleFromDb = await this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        permissions: data.permissions ? {
          deleteMany: {},
          create: data.permissions,
        } : undefined,
        parentId: data.parentId,
      },
      include: { permissions: true },
    });

    return new Role(
      roleFromDb.id,
      roleFromDb.type,
      roleFromDb.name,
      roleFromDb.isBuiltIn,
      roleFromDb.permissions as any[],
      roleFromDb.parentId,
    );
  }

  async delete(id: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      select: { isBuiltIn: true },
    });

    if (role?.isBuiltIn) {
      throw new ForbiddenException('Built-in roles cannot be deleted');
    }

    await this.prisma.role.delete({
      where: { id },
    });
  }
}
