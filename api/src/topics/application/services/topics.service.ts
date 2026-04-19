import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class TopicsService {
  constructor(private _prisma: PrismaService) {}

  async findAll() {
    return this._prisma.topic.findMany();
  }

  async findOneById(id: string) {
    return this._prisma.topic.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  async findOneBySlug(slug: string) {
    return this._prisma.topic.findFirstOrThrow({
      where: {
        slug,
      },
    });
  }

  async findUsedByUser(userId: string) {
    return this._prisma.topic.findMany({
      where: {
        publications: {
          some: {
            authorId: userId,
          },
        },
      },
    });
  }

  async findUsedByTutorialInstructor(userId: string) {
    return this._prisma.topic.findMany({
      where: {
        tutorial: {
          authorId: userId,
        },
      },
    });
  }
}
