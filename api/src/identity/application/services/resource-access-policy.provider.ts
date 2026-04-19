import { AbilityBuilder } from '@casl/ability';
import { AppAbility } from './ability.factory';
import { IPolicyProvider } from './policy-provider.interface';
import { Action } from '../../../common/domain/interfaces/action.enum';
import { User } from '../../domain/entities/user.entity';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { Subject } from '../../../common/domain/interfaces/subject.type';

@Injectable()
export class ResourceAccessPolicyProvider implements IPolicyProvider {
  constructor(private readonly prisma: PrismaService) {}

  async applyRules(builder: AbilityBuilder<AppAbility>, user: User): Promise<void> {
    const { can } = builder;

    const resourceAccess = await this.prisma.resourceAccess.findMany({
      where: {
        subjectId: user.id,
        subjectType: 'user',
      },
    });

    resourceAccess.forEach((access) => {
      const subject = this.mapResourceTypeToSubject(access.resourceType);
      if (!subject) return;

      const actions = this.getPermissionsByResourceRole(access.role);
      actions.forEach((action) => {
        // NOTE: Here we use conditions for matching by ID.
        // mongoQueryMatcher in AbilityFactory will handle this.
        can(action, subject as any, { id: access.resourceId } as any);
      });
    });
  }

  private mapResourceTypeToSubject(resourceType: string): Subject | null {
    const mapping: Record<string, Subject> = {
      channel: 'ChannelEntity',
      publication: 'Publication',
      tutorial: 'Tutorial',
      topic: 'TopicEntity',
      thread: 'Thread',
    };
    return mapping[resourceType] || null;
  }

  private getPermissionsByResourceRole(role: string): Action[] {
    switch (role) {
      case 'owner':
        return [Action.Manage];
      case 'moderator':
        return [Action.Read, Action.Create, Action.Update, Action.Delete];
      case 'editor':
        return [Action.Read, Action.Create, Action.Update];
      case 'viewer':
        return [Action.Read];
      default:
        return [];
    }
  }
}
