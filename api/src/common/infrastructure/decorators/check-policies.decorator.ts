import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { AppAbility } from '../../../identity/application/services/ability.factory';

export type PolicyHandler = (ability: AppAbility, ctx: ExecutionContext) => boolean;
export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
