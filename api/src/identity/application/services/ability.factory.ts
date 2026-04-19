import {
  AbilityBuilder,
  PureAbility,
  AbilityClass,
  mongoQueryMatcher,
  fieldPatternMatcher,
} from '@casl/ability';
import { Injectable, Inject, Optional } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { Action } from '@/common/domain/interfaces/action.enum';
import { Subject } from '@/common/domain/interfaces/subject.type';
import { IPolicyProvider, POLICY_PROVIDERS } from './policy-provider.interface';
import { SettingsService } from '@/settings/application/services/settings.service';

export type AppAbility = PureAbility<[Action, Subject]>;

@Injectable()
export class AbilityFactory {
  constructor(
    private readonly settingsService: SettingsService,
    @Inject(POLICY_PROVIDERS)
    private readonly policyProviders: IPolicyProvider[],
  ) {}

  async createForUser(user: User | null) {
    const builder = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>,
    );
    const { can, build, cannot } = builder;

    // --- 1. Default Public Rules ---
    // Everyone can read content
    can(Action.Read, 'Publication');
    can(Action.Read, 'Tutorial');
    can(Action.Read, 'ChannelEntity');
    can(Action.Read, 'TopicEntity');
    can(Action.Read, 'PageEntity');
    can(Action.Read, 'Thread');

    if (user) {
      // Authenticated users can create purchases (checkouts)
      can(Action.Create, 'Purchase');

      // --- 2. ABAC: Registry of Rules via Policy Providers ---
      for (const provider of this.policyProviders) {
        if (!provider) {
          console.warn('AbilityFactory: skipping undefined policy provider');
          continue;
        }
        await provider.applyRules(builder, user);
      }

      // Profile management (user can update only own profile)
      can(Action.Update, 'User', { id: user.id } as any);

      // --- 3. SuperAdmin Override ---
      // Moved after policyProviders to ensure SuperAdmin has all powers regardless of providers
      if (user.isSuperAdmin) {
        can(Action.Manage, 'all');
      }
    }

    // --- 5. External configuration restrictions (Apply to everyone) ---
    const monetizationSettings =
      await this.settingsService.findAllFlatten('monetization');

    if (!monetizationSettings.monetizationCreditsEnabled) {
      cannot(Action.Manage, 'Credits');
      cannot(Action.Read, 'Credits');

      if (user?.isSuperAdmin) {
        can(Action.Manage, 'Credits');
        can(Action.Read, 'Credits');
      }
    }

    const stripeConfigured = await this.settingsService.findValueByName(
      'stripeConfigured',
      false,
    );

    if (!stripeConfigured) {
      cannot(Action.Manage, 'Stripe');
    }

    const ability = build({
      conditionsMatcher: mongoQueryMatcher,
      fieldMatcher: fieldPatternMatcher,
      detectSubjectType: (item) => {
        if (typeof item === 'string') return item;
        return (item as any).name || (item.constructor as any).name;
      },
    });

    return ability;
  }
}
