export const REACTIONS_REPOSITORY = 'REACTIONS_REPOSITORY';

import { Reaction } from '../entities/reaction.entity';

export interface ReactionsRepositoryInterface {
  // catalog of available reactions
  findAll(): Promise<Reaction[]>;
  findByIdOrFail(id: string): Promise<Reaction>;

  add(
    actorId: string,
    targetType: string,
    targetId: string,
    reactionId: string,
  ): Promise<void>;
  exists(
    actorId: string,
    targetType: string,
    targetId: string,
    reactionId: string,
  ): Promise<boolean>;
  delete(
    actorId: string,
    targetType: string,
    targetId: string,
    reactionId: string,
  ): Promise<void>;
}
