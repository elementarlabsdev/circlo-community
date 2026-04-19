import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IImageDesignRepository, IMAGE_DESIGN_REPOSITORY } from '../../domain/repositories/image-design.repository.interface';

@Injectable()
export class DeleteImageDesignUseCase {
  constructor(
    @Inject(IMAGE_DESIGN_REPOSITORY)
    private readonly coverRepository: IImageDesignRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const design = await this.coverRepository.findById(id);
    if (!design) {
      throw new NotFoundException('Cover design not found');
    }

    if (design.userId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this design');
    }

    await this.coverRepository.delete(id);
  }
}
