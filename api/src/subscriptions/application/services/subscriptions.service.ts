import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private _prisma: PrismaService) {}

  async add(follower: User, target: any) {
    const subscription = await this._prisma.subscription.create({
      data: {
        follower: {
          connect: {
            id: follower.id,
          },
        },
        targetType: target.subscriptionType,
        targetId: target.id,
      },
    });
    const subscriptionType = target.subscriptionType as string;
    await this._prisma[subscriptionType].update({
      where: {
        id: target.id,
      },
      data: {
        followersCount: {
          increment: 1,
        },
      },
    });
    return subscription;
  }

  async exists(follower: User, target: any): Promise<boolean> {
    if (!follower) {
      return false;
    }

    return (
      (await this._prisma.subscription.count({
        where: {
          targetType: target.subscriptionType,
          targetId: target.id,
          followerId: follower.id,
        },
      })) > 0
    );
  }

  async remove(follower: User, target: any): Promise<void> {
    await this._prisma.subscription.deleteMany({
      where: {
        targetType: target.subscriptionType,
        targetId: target.id,
        follower: {
          id: follower.id,
        },
      },
    });
    const subscriptionType = target.subscriptionType as string;
    await this._prisma[subscriptionType].update({
      where: {
        id: target.id,
      },
      data: {
        followersCount: {
          decrement: 1,
        },
      },
    });
  }

  async get(follower: User, target: any) {
    if (!follower) {
      return null;
    }

    return {
      type: target.subscriptionType,
      id: target.id,
      isFollowing: await this.exists(follower, target),
      followersCount: target.followersCount,
    };
  }
}
