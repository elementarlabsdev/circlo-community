import { Injectable, Inject } from '@nestjs/common';
import { IImageDesignRepository, IMAGE_DESIGN_REPOSITORY } from '../../domain/repositories/image-design.repository.interface';
import { ImageDesignEntity } from '../../domain/entities/image-design.entity';
import { CreateImageDesignDto } from '../dtos/image-design.dto';

@Injectable()
export class CreateImageDesignUseCase {
  constructor(
    @Inject(IMAGE_DESIGN_REPOSITORY)
    private readonly coverRepository: IImageDesignRepository,
  ) {}

  async execute(userId: string, dto: CreateImageDesignDto): Promise<ImageDesignEntity> {
    const existingCount = (await this.coverRepository.findByUserId(userId)).length;
    const name = dto.name || `Cover Design ${existingCount + 1} ${Math.random().toString(36).substring(7)}`;

    const design = ImageDesignEntity.create({
      name,
      userId,
      resultImageUrl: null,
      snapshot: {}, // Initial empty snapshot
    });

    await this.coverRepository.save(design);
    return design;
  }
}
