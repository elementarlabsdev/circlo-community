import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IImageDesignRepository, IMAGE_DESIGN_REPOSITORY } from '../../domain/repositories/image-design.repository.interface';
import { ImageDesignEntity } from '../../domain/entities/image-design.entity';
import { UpdateImageDesignDto } from '../dtos/image-design.dto';

@Injectable()
export class UpdateImageDesignUseCase {
  constructor(
    @Inject(IMAGE_DESIGN_REPOSITORY)
    private readonly coverRepository: IImageDesignRepository,
  ) {}

  async execute(id: string, userId: string, dto: UpdateImageDesignDto): Promise<ImageDesignEntity> {
    const design = await this.coverRepository.findById(id);
    if (!design) {
      throw new NotFoundException('Cover design not found');
    }

    if (design.userId !== userId) {
      throw new ForbiddenException('You are not allowed to edit this design');
    }

    design.update(dto);
    await this.coverRepository.save(design);
    return design;
  }
}
