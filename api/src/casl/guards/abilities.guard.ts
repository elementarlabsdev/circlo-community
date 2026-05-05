import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from '@/identity/application/services/ability.factory';
import {
  AbilityRequirement,
  CHECK_ABILITIES_KEY,
} from '../decorators/check-abilities.decorator';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules =
      this.reflector.get<AbilityRequirement[]>(
        CHECK_ABILITIES_KEY,
        context.getHandler(),
      ) || [];

    if (rules.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    const ability = await this.abilityFactory.createForUser(user);

    for (const rule of rules) {
      const { action, subject } = rule;

      // 1. Check virtual sections (e.g., 'AdminPanel', 'Studio')
      const isVirtual = ['AdminPanel', 'Studio', 'all'].includes(subject);

      if (isVirtual) {
        if (!ability.can(action, subject)) {
          throw new ForbiddenException('Access denied to virtual section');
        }
        continue;
      }

      // 2. Check models (e.g., 'Content' -> 'Publication', 'Tutorial', etc.)
      // In Prisma, models are usually capitalized, same as in CASL subject.
      // If params.id is present, load the object.
      const id = request.params.id;

      if (id) {
        // We assume that subject matches the model name in Prisma (lowercase for access to prisma[model])
        // For example, if subject = 'Publication', then prisma.publication.findUnique
        const modelName = subject.charAt(0).toLowerCase() + subject.slice(1);

        if (!(this.prisma as any)[modelName]) {
           // If such a model doesn't exist in Prisma, check as a string
           if (!ability.can(action, subject)) {
              throw new ForbiddenException(`Access denied to ${subject}`);
           }
           continue;
        }

        const item = await (this.prisma as any)[modelName].findUnique({
          where: { id },
        });

        if (!item) {
          throw new NotFoundException(`${subject} not found`);
        }

        // Set the type for CASL so it understands what kind of object it is.
        // Since Prisma returns a plain JS object, CASL doesn't know its constructor.
        // We can manually add the constructor.name property for detectSubjectType
        Object.defineProperty(item, 'constructor', {
           value: { name: subject },
           enumerable: false
        });

        if (!ability.can(action, item)) {
          throw new ForbiddenException(`Access denied to this ${subject}`);
        }
      } else {
        // Check permission for the type as a whole
        if (!ability.can(action, subject)) {
          throw new ForbiddenException(`Access denied to ${subject}`);
        }
      }
    }

    return true;
  }
}
