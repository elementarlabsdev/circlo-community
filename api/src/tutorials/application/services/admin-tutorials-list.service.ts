import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class AdminTutorialsListService {
  constructor(private readonly prisma: PrismaService) {}

  async unpublish(id: string): Promise<void> {
    // Set status to draft and clear publishedAt
    await this.prisma.tutorial.update({
      where: { id },
      data: {
        status: { connect: { type: 'draft' } },
        publishedAt: null,
      },
    });
  }

  async bulkUnpublish(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.unpublish(id);
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tutorial.delete({ where: { id } });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.delete(id);
    }
  }

  async syncAllCommentsCount(): Promise<void> {
    const tutorials = await this.prisma.tutorial.findMany({
      include: {
        lessons: true,
        sections: {
          include: {
            items: {
              include: {
                lesson: true,
              },
            },
          },
        },
      },
    });

    for (const tutorial of tutorials) {
      let totalComments = 0;

      // Direct lessons
      for (const lesson of tutorial.lessons) {
        totalComments += lesson.commentsCount;
      }

      // Lessons in sections
      for (const section of tutorial.sections) {
        for (const item of section.items) {
          if (item.lesson) {
            totalComments += item.lesson.commentsCount;
          }
        }
      }

      if (tutorial.commentsCount !== totalComments) {
        await this.prisma.tutorial.update({
          where: { id: tutorial.id },
          data: { commentsCount: totalComments },
        });
      }
    }
  }
}
