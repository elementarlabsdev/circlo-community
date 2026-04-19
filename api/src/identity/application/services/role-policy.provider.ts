import { AbilityBuilder } from '@casl/ability';
import { AppAbility } from './ability.factory';
import { IPolicyProvider } from './policy-provider.interface';
import { User } from '../../domain/entities/user.entity';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { Action } from '@/common/domain/interfaces/action.enum';

@Injectable()
export class RolePolicyProvider implements IPolicyProvider {
  constructor(private readonly prisma: PrismaService) {}

  async applyRules(
    builder: AbilityBuilder<AppAbility>,
    user: User,
  ): Promise<void> {
    const { can, cannot } = builder;

    if (!user.roleId) {
      return;
    }

    const roles = await this.getAllRolesForUser(user.roleId);

    for (const role of roles) {
      const permissions = Array.isArray(role.permissions)
        ? role.permissions
        : [];

      for (const permission of permissions) {
        let { action, subject, conditions, inverted, reason } = permission;

        // Ensure subject is always a string to prevent JSON serialization issues
        if (subject && typeof subject !== 'string') {
          subject = (subject as any).name || (subject as any).constructor?.name;
        }

        // Replace placeholders in conditions
        if (conditions && typeof conditions === 'object') {
          const conditionsStr = JSON.stringify(conditions)
            .replace(/\{\{user\.id\}\}/g, user.id)
            .replace(/\$\{user\.id\}/g, user.id);
          conditions = JSON.parse(conditionsStr);
        }

        if (inverted) {
          cannot(action as Action, subject, conditions).because(reason);
        } else {
          can(action as Action, subject, conditions);
        }
      }
    }
  }

  private async getAllRolesForUser(roleId: string): Promise<any[]> {
    const roles: any[] = [];
    let currentId: string | null = roleId;

    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const role = await this.prisma.role.findUnique({
        where: { id: currentId },
        select: {
          id: true,
          type: true,
          permissions: {
            select: {
              action: true,
              subject: true,
              conditions: true,
              inverted: true,
              reason: true,
            },
          },
          parentId: true,
        },
      });

      if (!role) {
        break;
      }

      roles.push(role);
      currentId = role.parentId;
    }

    // Return roles in order from parent to child so child rules can override parent rules
    return roles.reverse();
  }
}
