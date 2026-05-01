import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ThreadRepositoryInterface } from '../../domain/repositories/thread-repository.interface';
import { Thread, ThreadPrimitives } from '../../domain/entities/thread.entity';

@Injectable()
export class ThreadsPrismaRepository implements ThreadRepositoryInterface {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private map(row: any): Thread {
    return Thread.fromPersistence(row);
  }

  async findByIdOrFail(id: string): Promise<Thread> {
    const row = await this.prisma.thread.findUniqueOrThrow({
      where: { id },
      include: {
        author: true,
        respondingTo: true,
        mainThread: true,
        status: true,
        mediaItems: true,
        poll: {
          include: {
            options: true,
          },
        },
      },
    });
    return Thread.fromPersistence(row);
  }

  async findChildren(parentId: string): Promise<Thread[]> {
    const rows = await this.prisma.thread.findMany({
      where: { respondingToId: parentId },
      include: {
        author: true,
        respondingTo: true,
        mainThread: true,
        status: true,
        mediaItems: true,
        poll: {
          include: {
            options: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => this.map(r));
  }

  async listByAuthor(authorId: string): Promise<Thread[]> {
    const rows = await this.prisma.thread.findMany({
      where: { authorId },
      include: {
        respondingTo: true,
        mainThread: true,
        status: true,
        mediaItems: true,
        poll: {
          include: {
            options: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.map(r));
  }

  async createRoot(authorId: string, textContent: string, mediaItemIds?: string[]): Promise<Thread> {
    const htmlContent = textContent.replace(/\n/g, '<br>');
    const row = await this.prisma.thread.create({
      data: {
        author: { connect: { id: authorId } },
        textContent,
        htmlContent,
        depth: 0,
        createdAt: new Date(),
        status: { connect: { type: 'published' } },
        mediaItems: mediaItemIds?.length ? {
          connect: mediaItemIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        author: true,
        mainThread: true,
        status: true,
        mediaItems: true,
        poll: {
          include: {
            options: true,
          },
        },
      },
    });
    return this.map(row);
  }

  async reply(
    parent: Thread,
    authorId: string,
    textContent: string,
  ): Promise<Thread> {
    const htmlContent = textContent.replace(/\n/g, '<br>');
    const result = await this.prisma.$transaction(async (tx) => {
      const created = await tx.thread.create({
        data: {
          author: { connect: { id: authorId } },
          textContent,
          htmlContent,
          depth: (parent.depth ?? 0) + 1,
          respondingTo: { connect: { id: parent.id } },
          mainThread: { connect: { id: parent.mainThreadId || parent.id } },
          createdAt: new Date(),
          status: { connect: { type: 'published' } },
        },
        include: {
          author: true,
          respondingTo: true,
          mainThread: true,
          status: true,
          poll: {
            include: {
              options: true,
            },
          },
        },
      });

      // Update repliesCount for direct parent
      if (parent.id) {
        await tx.thread.update({
          where: { id: parent.id },
          data: { repliesCount: { increment: 1 } as any },
        });
      }

      return created;
    });

    return this.map(result);
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const row = await tx.thread.findUnique({
        where: { id },
        select: { id: true, respondingToId: true },
      });
      if (!row) return;

      // 1. Delete associated data
      await tx.reactionList.deleteMany({
        where: { targetId: id, targetType: 'thread' },
      });
      await tx.bookmark.deleteMany({
        where: { targetId: id, targetType: 'thread' },
      });
      await tx.complaint.deleteMany({
        where: { targetId: id, targetType: 'thread' },
      });

      // 2. Handle children (replies)
      const children = await tx.thread.findMany({
        where: { respondingToId: id },
        select: { id: true },
      });

      for (const child of children) {
        await this.deleteThreadRecursive(child.id, tx);
      }

      // 3. Delete the thread itself
      await tx.thread.delete({ where: { id: row.id } });

      // 4. Update repliesCount for direct parent
      if (row.respondingToId) {
        await tx.thread.update({
          where: { id: row.respondingToId },
          data: { repliesCount: { increment: -1 } as any },
        });
      }
    });
  }

  private async deleteThreadRecursive(id: string, tx: any): Promise<void> {
    // 1. Delete associated data
    await tx.reactionList.deleteMany({
      where: { targetId: id, targetType: 'thread' },
    });
    await tx.bookmark.deleteMany({
      where: { targetId: id, targetType: 'thread' },
    });
    await tx.complaint.deleteMany({
      where: { targetId: id, targetType: 'thread' },
    });

    // 2. Handle nested children
    const children = await tx.thread.findMany({
      where: { respondingToId: id },
      select: { id: true },
    });

    for (const child of children) {
      await this.deleteThreadRecursive(child.id, tx);
    }

    // 3. Delete the thread itself
    await tx.thread.delete({ where: { id } });
  }

  async updateRepliesCount(threadId: string, delta: number): Promise<void> {
    await this.prisma.thread.update({
      where: { id: threadId },
      data: { repliesCount: { increment: delta } as any },
    });
  }

  async update(id: string, data: Partial<ThreadPrimitives>): Promise<Thread> {
    const row = await this.prisma.thread.update({
      where: { id },
      data: {
        textContent: data.textContent,
        htmlContent: data.htmlContent,
        reactionsCount: data.reactionsCount,
        repliesCount: data.repliesCount,
        isHidden: data.isHidden,
      },
      include: {
        author: true,
        respondingTo: true,
        mainThread: true,
        status: true,
        mediaItems: true,
        poll: {
          include: {
            options: true,
          },
        },
      },
    });
    return this.map(row);
  }
}
