import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private _prisma: PrismaService) {}

  async findByIdOrFail(id: string) {
    return this._prisma.comment.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }
}
