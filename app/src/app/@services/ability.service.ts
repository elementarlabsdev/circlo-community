import { Injectable, inject } from '@angular/core';
import { Ability, AbilityBuilder, PureAbility, AbilityClass, ExtractSubjectType } from '@casl/ability';
import { AppStore } from '@store/app.store';
import { effect } from '@angular/core';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

// Упрощенный тип для фронтенда, при необходимости расширить
export type Subject = any;
export type AppAbility = PureAbility<[Action, Subject]>;

@Injectable({ providedIn: 'root' })
export class AbilityService {
  private appStore = inject(AppStore);
  private ability = inject(Ability) as AppAbility;

  constructor() {
    effect(() => {
      const rules = this.appStore.rules();
      this.updateAbility(rules);
    });
  }

  private updateAbility(rules: any[]) {
    (this.ability as any).detectSubjectType = (item: any) => {
      if (typeof item === 'string') return item;
      if (item && (item.authorId || item.author?.id || item.creatorId || item.creator?.id)) {
        if (item.lessonsCount !== undefined || item.sections !== undefined || item.editId !== undefined) return 'Tutorial';
        return 'Publication';
      }
      if (item && (item.ownerId || item.publicationsCount !== undefined)) {
        return 'ChannelEntity';
      }
      if (item && item.isPage !== undefined) return 'PageEntity';
      if (item && item.topicId !== undefined) return 'TopicEntity';
      if (item && item.__typename) return item.__typename;
      return item?.constructor?.name || item;
    };

    this.ability.update(rules);
  }
}
