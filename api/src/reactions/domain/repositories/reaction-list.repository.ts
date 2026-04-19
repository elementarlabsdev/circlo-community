export const REACTION_LIST_REPOSITORY = 'REACTION_LIST_REPOSITORY';

import { ReactionList } from '../entities/reaction-list.entity';

export interface ReactionListRepositoryInterface {
  add(actorId: string, targetType: string, targetId: string, reactionId: string): Promise<void>;
  exists(actorId: string, targetType: string, targetId: string, reactionId: string): Promise<boolean>;
  delete(actorId: string, targetType: string, targetId: string, reactionId: string): Promise<void>;
  countByTarget(targetType: string, targetId: string, reactionId?: string): Promise<number>;
  listByTarget(targetType: string, targetId: string): Promise<ReactionList[]>;
}
