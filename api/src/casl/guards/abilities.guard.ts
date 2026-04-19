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

      // 1. Проверка виртуальных разделов (напр. 'AdminPanel', 'Studio')
      const isVirtual = ['AdminPanel', 'Studio', 'all'].includes(subject);

      if (isVirtual) {
        if (!ability.can(action, subject)) {
          throw new ForbiddenException('Access denied to virtual section');
        }
        continue;
      }

      // 2. Проверка моделей (напр. 'Content' -> 'Publication', 'Tutorial' и т.д.)
      // В Prisma модели обычно с большой буквы, как и в CASL subject.
      // Если есть params.id, загружаем объект.
      const id = request.params.id;

      if (id) {
        // Мы предполагаем, что subject соответствует имени модели в Prisma (в нижнем регистре для доступа к prisma[model])
        // Например, если subject = 'Publication', то prisma.publication.findUnique
        const modelName = subject.charAt(0).toLowerCase() + subject.slice(1);

        if (!(this.prisma as any)[modelName]) {
           // Если такой модели нет в Prisma, проверяем как строку
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

        // Устанавливаем тип для CASL, чтобы он понимал, что это за объект
        // Т.к. Prisma возвращает обычный JS объект, CASL не знает его конструктор.
        // Мы можем добавить свойство constructor.name вручную для detectSubjectType
        Object.defineProperty(item, 'constructor', {
           value: { name: subject },
           enumerable: false
        });

        if (!ability.can(action, item)) {
          throw new ForbiddenException(`Access denied to this ${subject}`);
        }
      } else {
        // Проверка права на тип в целом
        if (!ability.can(action, subject)) {
          throw new ForbiddenException(`Access denied to ${subject}`);
        }
      }
    }

    return true;
  }
}
