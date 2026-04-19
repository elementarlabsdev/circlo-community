import { BadRequestException, Injectable } from '@nestjs/common';
import { Channel, User } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ChannelDto } from '@/channels/application/dto/channel.dto';
import { CreateChannelDto } from '@/channels/application/dto/create-channel.dto';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';

@Injectable()
export class ChannelsService {
  constructor(
    private _prisma: PrismaService,
    private _subscriptionsService: SubscriptionsService,
  ) {}

  async findAll(): Promise<Channel[]> {
    return this._prisma.channel.findMany({
      orderBy: [
        {
          publicationsCount: 'desc',
        },
        {
          followersCount: 'desc',
        },
      ],
    });
  }

  async search(query: string, pageNumber = 1, pageSize = 20, userId: string = null): Promise<any> {
    const where = {
      visibility: {
        type: {
          in: ['public', 'private'],
        },
      },
    };

    if (userId) {
      where['OR'] = [
        {
          visibility: {
            type: {
              in: ['public', 'private'],
            },
          },
        },
        { ownerId: userId },
      ];
      delete where.visibility;
    }

    if (query.trim()) {
      where['name'] = {
        contains: query.trim(),
        mode: 'insensitive',
      };
    }

    const totalCount = await this._prisma.channel.count({
      where,
    });
    const items = await this._prisma.channel.findMany({
      where,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      orderBy: [
        {
          publicationsCount: 'desc',
        },
        {
          followersCount: 'desc',
        },
      ],
    });

    return {
      totalCount,
      items,
      pageSize,
    };
  }

  async findAllPublic(): Promise<Channel[]> {
    return this._prisma.channel.findMany({
      where: {
        visibility: {
          type: {
            in: ['public', 'private'],
          },
        },
      },
      orderBy: [
        {
          publicationsCount: 'desc',
        },
        {
          followersCount: 'desc',
        },
      ],
    });
  }

  async uniqueSlugValidate(slug: string, channelId: string | null): Promise<boolean> {
    const where: any = {
      slug,
    };

    if (channelId) {
      where.id = {
        not: channelId,
      };
    }

    return (await this._prisma.channel.count({ where })) > 0;
  }

  async findOneById(id: string): Promise<Channel> {
    return this._prisma.channel.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  async findOneByUser(user: User) {
    return this._prisma.channel.findFirstOrThrow({
      where: {
        owner: {
          id: user.id,
        },
      },
    });
  }

  async findOneBySlug(slug: string) {
    return this._prisma.channel.findUniqueOrThrow({
      where: {
        slug,
      },
      include: {
        rules: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });
  }

  async save(channel: any, channelDto: ChannelDto) {
    await this._prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: channelDto,
    });
  }

  async findUsedByUser(userId: string) {
    return this._prisma.channel.findMany({
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
    return this._prisma.channel.findMany({
      where: {
        tutorials: {
          some: {
            authorId: userId,
          },
        },
      },
    });
  }

  async findOneByOwner(id: string, ownerId: string) {
    return this._prisma.channel.findFirst({
      where: {
        id,
        ownerId,
      },
      include: {
        rules: true,
        logo: true,
        moderators: true,
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

  async findByOwner(userId: string) {
    return this._prisma.channel.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        rules: true,
        logo: true,
        moderators: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(userId: string, channelDto: CreateChannelDto) {
    const data = {};

    if (channelDto.logoId) {
      data['logo'] = {
        connect: {
          id: channelDto.logoId,
        },
      };
    }

    if (channelDto.moderatorIds) {
      data['moderators'] = {
        connect: channelDto.moderatorIds.map((id) => ({ id })),
      };
    }

    const channel = await this._prisma.channel.create({
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
        owner: {
          connect: {
            id: userId,
          },
        },
        rules: {
          create: channelDto.rules?.map((rule) => ({
            name: rule.name,
            description: rule.description,
          })) ?? [],
        },
        ...data,
      },
    });

    const user = await this._prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user) {
      await this._subscriptionsService.add(user, channel);
    }

    return channel;
  }

  async update(userId: string, id: string, channelDto: CreateChannelDto) {
    const channel = await this._prisma.channel.findFirstOrThrow({
      where: {
        id,
        ownerId: userId,
      },
    });

    const data = {
      name: channelDto.name,
      description: channelDto.description,
      logoUrl: channelDto.logoUrl,
      slug: channelDto.slug,
      metaTitle: channelDto.metaTitle,
      metaDescription: channelDto.metaDescription,
      accessType: channelDto.accessType,
      price: 0,
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

    if (channelDto.moderatorIds) {
      data['moderators'] = {
        set: channelDto.moderatorIds.map((id) => ({ id })),
      };
    }

    // Simple rule update: delete and recreate for simplicity as in admin
    await this._prisma.channelRule.deleteMany({
      where: {
        channelId: id,
      },
    });

    return this._prisma.channel.update({
      where: {
        id,
      },
      data: {
        ...data,
        rules: {
          create: channelDto.rules?.map((rule) => ({
            name: rule.name,
            description: rule.description,
          })) ?? [],
        },
      },
    });
  }

  async delete(userId: string, id: string) {
    const channel = await this._prisma.channel.findFirstOrThrow({
      where: {
        id,
        ownerId: userId,
      },
    });

    return this._prisma.channel.delete({
      where: {
        id: channel.id,
      },
    });
  }
}
