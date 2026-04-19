import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { IImageDesignRepository } from '../../domain/repositories/image-design.repository.interface';
import {
  ImageDesignEntity,
  ImageDesignPrimitives,
} from '../../domain/entities/image-design.entity';

@Injectable()
export class ImageDesignPrismaRepository implements IImageDesignRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(design: ImageDesignEntity): Promise<void> {
    const primitives = design.toPrimitives();

    await this.prisma.imageDesign.upsert({
      where: { id: primitives.id },
      update: {
        name: primitives.name,
        snapshot: primitives.snapshot,
        resultImageUrl: primitives.resultImageUrl,
        updatedAt: primitives.updatedAt,
      },
      create: {
        id: primitives.id,
        name: primitives.name,
        snapshot: primitives.snapshot,
        userId: primitives.userId,
        resultImageUrl: primitives.resultImageUrl,
        createdAt: primitives.createdAt,
        updatedAt: primitives.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<ImageDesignEntity | null> {
    const model = await this.prisma.imageDesign.findUnique({
      where: { id },
    });

    if (!model) return null;

    return ImageDesignEntity.reconstitute(
      model as unknown as ImageDesignPrimitives,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.imageDesign.delete({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<ImageDesignEntity[]> {
    const models = await this.prisma.imageDesign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return models.map((model) =>
      ImageDesignEntity.reconstitute(model as unknown as ImageDesignPrimitives),
    );
  }
}
