import { BadRequestException, Injectable } from '@nestjs/common';
import { Channel } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { CreateChannelDto } from '@/channels/application/dto/create-channel.dto';

@Injectable()
export class AdminChannelListService {
  constructor(private _prisma: PrismaService) {}

  async slugValidate(
    slug: string,
    channelId: string | null = null,
  ): Promise<boolean> {
    const where = {};

    if (channelId) {
      where['id'] = {
        notIn: [channelId],
      };
    }

    return (
      (await this._prisma.channel.count({
        where: {
          slug,
          ...where,
        },
      })) > 0
    );
  }

  async createNew(channelDto: CreateChannelDto): Promise<Channel> {
    const data = {};

    if (channelDto.logoId) {
      data['logo'] = {
        connect: {
          id: channelDto.logoId,
        },
      };
    }

    return this._prisma.channel.create({
      data: {
        name: channelDto.name,
        slug: channelDto.slug,
        description: channelDto.description,
        logoUrl: channelDto.logoUrl,
        metaTitle: channelDto.metaTitle,
        metaDescription: channelDto.metaDescription,
        accessType: channelDto.accessType,
        price: 0,
        visibility: {
          connect: {
            id: channelDto.visibilityId,
          },
        },
        rules: {
          connectOrCreate: channelDto.rules.map((ruleChannelDto) => {
            return {
              where: {
                id: ruleChannelDto.id ?? crypto.randomUUID(),
              },
              create: {
                name: ruleChannelDto.name,
                description: ruleChannelDto.description,
              },
            };
          }),
        },
        createdAt: new Date(),
        owner: channelDto.ownerId ? {
          connect: {
            id: channelDto.ownerId,
          },
        } : undefined,
        moderators: {
          connect: channelDto.moderatorIds?.map((id) => ({ id })) ?? [],
        },
        ...data,
      },
    });
  }

  async findOneById(id: string): Promise<any> {
    return this._prisma.channel.findUnique({
      where: {
        id,
      },
      include: {
        rules: true,
        logo: true,
        moderators: true,
        owner: true,
      },
    });
  }

  async save(id: string, channelDto: CreateChannelDto): Promise<Channel> {
    const channel = await this.findOneById(id);
    const data = {
      name: channelDto.name,
      description: channelDto.description,
      logoUrl: channelDto.logoUrl,
      slug: channelDto.slug,
      metaTitle: channelDto.metaTitle,
      metaDescription: channelDto.metaDescription,
      accessType: channelDto.accessType,
      price: 0,
      ownerId: channelDto.ownerId,
    };

    if (channelDto.visibilityId) {
      data['visibility'] = {
        connect: {
          id: channelDto.visibilityId,
        },
      };
    }

    if (channelDto.logoId) {
      data['logo'] = {
        connect: {
          id: channelDto.logoId,
        },
      };
    } else {
      data['logoId'] = null;
    }

    const rules = [];

    for (const ruleDto of channelDto.rules) {
      if (ruleDto.id) {
        const rule = await this._prisma.channelRule.update({
          where: {
            id: ruleDto.id,
          },
          data: {
            name: ruleDto.name,
            description: ruleDto.description,
          },
        });
        rules.push(rule);
      } else {
        const rule = await this._prisma.channelRule.create({
          data: {
            name: ruleDto.name,
            description: ruleDto.description,
            channel: {
              connect: {
                id: channel.id,
              },
            },
          },
        });
        rules.push(rule);
      }
    }

    await this._prisma.channelRule.deleteMany({
      where: {
        id: {
          notIn: rules.map(({ id }) => id),
        },
        channel: {
          id: channel.id,
        },
      },
    });

    return this._prisma.channel.update({
      where: {
        id,
      },
      data: {
        ...data,
        rules: {
          set: rules,
        },
        moderators: {
          set: channelDto.moderatorIds?.map((id) => ({ id })) ?? [],
        },
      },
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

    const items: Channel[] = await this._prisma.channel.findMany({
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
    const totalItems = await this._prisma.channel.count({});
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
    const channel = await this.findOneById(id);

    if (!channel) {
      return;
    }

    if (channel.logoId) {
      await this._prisma.mediaItem.update({
        where: {
          id: channel.logoId,
        },
        data: {
          deleted: true,
        },
      });
    }

    await this._prisma.channel.delete({
      where: {
        id,
      },
    });
  }

  async findVisibilities(): Promise<any[]> {
    return this._prisma.channelVisibility.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}
