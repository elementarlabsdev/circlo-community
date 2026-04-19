import { Injectable, Inject } from '@nestjs/common';
import {
  REACTIONS_REPOSITORY,
  ReactionsRepositoryInterface,
} from '@/reactions/domain/repositories/reactions.repository';
import { Reaction } from '@/reactions/domain/entities/reaction.entity';

@Injectable()
export class ReactionsCatalogService {
  constructor(
    @Inject(REACTIONS_REPOSITORY)
    private readonly reactionsRepo: ReactionsRepositoryInterface,
  ) {}

  async findAll(): Promise<Reaction[]> {
    return this.reactionsRepo.findAll();
  }

  async findOneByIdOrFail(id: string): Promise<Reaction> {
    return this.reactionsRepo.findByIdOrFail(id);
  }
}
