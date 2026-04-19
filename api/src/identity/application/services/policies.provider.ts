import { AbilityBuilder } from '@casl/ability';
import { AppAbility } from './ability.factory';
import { IPolicyProvider } from './policy-provider.interface';
import { Action } from '../../../common/domain/interfaces/action.enum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DraftOnlyPolicyProvider implements IPolicyProvider {
  applyRules(builder: AbilityBuilder<AppAbility>): void {
    const { cannot } = builder;

    // User CANNOT edit a publication if it is not a draft
    cannot(Action.Update, 'Publication', {
      status: { type: { ne: 'draft' } },
    } as any);

    // User CANNOT edit a tutorial if its status is not 'draft'
    cannot(Action.Update, 'Tutorial', { status: { $ne: 'draft' } } as any);
  }
}

@Injectable()
export class OwnablePolicyProvider implements IPolicyProvider {
  private subjects: any[];
  constructor(subjects: any[]) {
    this.subjects = subjects;
  }

  applyRules(builder: AbilityBuilder<AppAbility>, user: any): void {
    const { can } = builder;
    this.subjects.forEach((subject) => {
      can(Action.Update, subject, { authorId: user.id } as any);
      can(Action.Delete, subject, { authorId: user.id } as any);
      can(Action.Update, subject, { ownerId: user.id } as any);
      can(Action.Delete, subject, { ownerId: user.id } as any);
    });
  }
}
