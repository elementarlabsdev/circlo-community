import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class AdminFindUserByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    return this.prisma.$extends({
      query: {
        user: {
          findUnique({ args, query }: any) {
            args.omit = { ...args.omit, email: false };
            return query(args);
          },
        },
      },
    }).user.findUnique({
      where: { id },
      include: {
        role: true,
        avatar: true,
        _count: {
          select: {
            publications: true,
            comments: true,
            subscriptions: true,
            channels: true,
            threads: true,
          },
        },
      },
    });
  }
}
