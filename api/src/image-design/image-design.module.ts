import { Global, Module } from '@nestjs/common';
import { StudioImageDesignController } from './infrastructure/controllers/studio-image-design.controller';
import { CreateImageDesignUseCase } from './application/use-cases/create-image-design.use-case';
import { UpdateImageDesignUseCase } from './application/use-cases/update-image-design.use-case';
import { DeleteImageDesignUseCase } from './application/use-cases/delete-image-design.use-case';
import { UpdateImageDesignResultImageUrlUseCase } from './application/use-cases/update-image-design-result-image-url.use-case';
import { ImageDesignPrismaRepository } from './infrastructure/persistence/image-design-prisma.repository';
import { IMAGE_DESIGN_REPOSITORY } from './domain/repositories/image-design.repository.interface';

@Global()
@Module({
  controllers: [StudioImageDesignController],
  providers: [
    CreateImageDesignUseCase,
    UpdateImageDesignUseCase,
    DeleteImageDesignUseCase,
    UpdateImageDesignResultImageUrlUseCase,
    {
      provide: IMAGE_DESIGN_REPOSITORY,
      useClass: ImageDesignPrismaRepository,
    },
  ],
})
export class ImageDesignModule {}
