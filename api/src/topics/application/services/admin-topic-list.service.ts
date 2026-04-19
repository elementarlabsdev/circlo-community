import { Injectable } from '@nestjs/common';
import { Topic } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { TopicDto } from '@/topics/application/dto/topic.dto';

@Injectable()
export class AdminTopicListService {
  constructor(private _prisma: PrismaService) {}

  async slugValidate(slug: string, topicId: string | null): Promise<boolean> {
    if (topicId) {
      return (
        (await this._prisma.topic.count({
          where: {
            slug,
            id: {
              notIn: [topicId],
            },
          },
        })) > 0
      );
    }

    return (
      (await this._prisma.topic.count({
        where: {
          slug,
        },
      })) > 0
    );
  }

  async createNew(topicDto: TopicDto): Promise<Topic> {
    const data = {
      name: topicDto.name,
      slug: topicDto.slug,
      description: topicDto.description,
      logoUrl: topicDto.logoUrl,
      createdAt: new Date(),
      metaTitle: topicDto.metaTitle,
      metaDescription: topicDto.metaDescription,
    };

    if (topicDto.logoId) {
      data['logo'] = {
        connect: {
          id: topicDto.logoId,
        },
      };
    }

    return this._prisma.topic.create({
      data,
    });
  }

  async findOneById(id: string): Promise<Topic> {
    return this._prisma.topic.findUnique({
      where: {
        id,
      },
      include: {
        logo: true,
      },
    });
  }

  async save(id: string, topicDto: TopicDto): Promise<Topic> {
    const data = {
      name: topicDto.name,
      slug: topicDto.slug,
      description: topicDto.description,
      logoUrl: topicDto.logoUrl,
      createdAt: new Date(),
      metaTitle: topicDto.metaTitle,
      metaDescription: topicDto.metaDescription,
    };

    if (topicDto.logoId) {
      data['logo'] = {
        connect: {
          id: topicDto.logoId,
        },
      };
    } else {
      data['logoId'] = null;
    }

    return this._prisma.topic.update({
      where: {
        id,
      },
      data,
    });
  }

  async findPaginated(
    pageSize: number,
    pageNumber: number,
    searchQuery = '',
    sortState = null,
  ) {
    const where = {};
    let orderBy: any = {
      createdAt: 'desc',
    };

    if (searchQuery) {
      where['title'] = {
        contains: searchQuery,
        mode: 'insensitive',
      };
    }

    if (sortState) {
      orderBy = sortState;
    }

    const items: Topic[] = await this._prisma.topic.findMany({
      where: {
        ...where,
      },
      orderBy: {
        ...orderBy,
      },
      include: {},
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });
    const totalItems = await this._prisma.topic.count();
    const pagination = {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      pageSize,
      pageNumber,
    };
    return {
      items,
      pagination,
    };
  }

  async bulkDelete(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.delete(id);
    }
  }

  async delete(id: string): Promise<void> {
    const topic = await this.findOneById(id);

    if (!topic) {
      return;
    }

    if (topic.logoId) {
      await this._prisma.mediaItem.update({
        where: {
          id: topic.logoId,
        },
        data: {
          deleted: true,
        },
      });
    }

    await this._prisma.topic.delete({
      where: {
        id,
      },
    });
  }
}
