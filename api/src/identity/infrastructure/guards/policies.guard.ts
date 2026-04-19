import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CHECK_POLICIES_KEY,
  PolicyHandler,
} from '@/common/infrastructure/decorators/check-policies.decorator';
import { AbilityFactory } from '@/identity/application/services/ability.factory';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    // Если не указаны политики — разрешаем доступ (явное ограничение через Guard или декоратор)
    if (handlers.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user || null;

    const ability = await this.abilityFactory.createForUser(user);
    return handlers.every((handler) => handler(ability, context));
  }
}
