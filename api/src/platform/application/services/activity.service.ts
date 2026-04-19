import { Injectable, Logger } from '@nestjs/common';
import { Activity, Prisma } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { PaginatedResult } from '@/common/domain/interfaces/interfaces';
import { CreateActivityDto } from '@/platform/application/dtos/create-activity.dto';
import { QueryActivityDto } from '@/platform/application/dtos/query-activity.dto';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(private prisma: PrismaService) {}

  async createActivity(
    createActivityDto: CreateActivityDto,
  ): Promise<Activity> {
    try {
      const activityData: Prisma.ActivityCreateInput = {
        actor: { connect: { id: createActivityDto.actor.id } },
        action: createActivityDto.action,
        targetType: createActivityDto.targetType,
        targetId: createActivityDto.targetId,
      };

      if (createActivityDto.details) {
        activityData.details = createActivityDto.details;
      }

      const activity = await this.prisma.activity.create({
        data: activityData,
        include: { actor: { select: { id: true, name: true, email: true } } },
      });

      this.logger.log(
        `Activity created: ${activity.action} by actor ${activity.actorId}`,
      );
      return activity;
    } catch (error) {
      this.logger.error(
        `Failed to create activity for actor ${createActivityDto.actor.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(
    queryDto: QueryActivityDto,
  ): Promise<PaginatedResult<Activity>> {
    const {
      page = 1,
      limit = 10,
      actorId,
      action,
      targetType,
      targetId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const skip = (page - 1) * limit;

    const where: Prisma.ActivityWhereInput = {};

    if (actorId) {
      where.actorId = actorId;
    }
    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }
    if (targetType) {
      where.targetType = { equals: targetType, mode: 'insensitive' };
    }
    if (targetId) {
      where.targetId = targetId;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.createdAt.lte = endOfDay;
      }
    }

    const orderBy: Prisma.ActivityOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    try {
      const [activities, total] = await this.prisma.$transaction([
        this.prisma.activity.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            actor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        this.prisma.activity.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: activities,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to find activities: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getActivitiesForUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<Activity[]> {
    const queryDto = new QueryActivityDto();
    queryDto.actorId = userId;
    queryDto.page = page;
    queryDto.limit = limit;
    const result = await this.findAll(queryDto);
    return result.data;
  }

  async getActivitiesForTarget(
    targetType: string,
    targetId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<Activity[]> {
    const queryDto = new QueryActivityDto();
    queryDto.targetType = targetType;
    queryDto.targetId = targetId;
    queryDto.page = page;
    queryDto.limit = limit;
    const result = await this.findAll(queryDto);
    return result.data;
  }

  async findOne(id: string): Promise<Activity | null> {
    try {
      return this.prisma.activity.findUnique({
        where: { id },
        include: {
          actor: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to find activity with id ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
