import { AbilityBuilder } from '@casl/ability';
import { AppAbility } from './ability.factory';

export interface IPolicyProvider {
  applyRules(
    builder: AbilityBuilder<AppAbility>,
    user: any,
  ): void | Promise<void>;
}

export const POLICY_PROVIDERS = 'POLICY_PROVIDERS';
