import { SetMetadata } from '@nestjs/common';
import { Action } from '@/common/domain/interfaces/action.enum';

export const CHECK_ABILITIES_KEY = 'check_abilities';

export interface AbilityRequirement {
  action: Action;
  subject: string;
}

export const CheckAbilities = (...requirements: [Action, string][]) =>
  SetMetadata(
    CHECK_ABILITIES_KEY,
    requirements.map(([action, subject]) => ({ action, subject })),
  );
