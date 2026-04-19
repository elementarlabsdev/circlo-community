import { Injectable } from '@nestjs/common';
import { Comment } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';
import sanitizeHtml from 'sanitize-html';
import { MarkdownService } from '@/common/infrastructure/markdown/markdown.service';

@Injectable()
export class CommentListService {
  constructor(
    private _prisma: PrismaService,
    private _markdown: MarkdownService,
  ) {}

  async findOneById(id: string): Promise<Comment> {
    return this._prisma.comment.findUnique({
      where: {
        id,
      },
      include: {
        author: true,
        publication: true,
        respondingTo: true,
      },
    });
  }

  async update(
    id: string,
    payload: { content?: string; htmlContent?: string; isHidden?: boolean },
  ): Promise<void> {
    const data: any = {};
    const contentToSanitize = payload.htmlContent || payload.content;

    if (contentToSanitize) {
      const htmlContent = await this._markdown.highlightCode(contentToSanitize);
      data.htmlContent = sanitizeHtml(htmlContent, {
        allowedTags: ['b', 'i', 'strong', 'img', 'a', 'span', 'pre', 'code'],
        allowedAttributes: {
          span: ['style', 'class'],
          code: ['class'],
          pre: ['style', 'class'],
        },
      });
      data.textContent = sanitizeHtml(contentToSanitize, {
        allowedTags: [],
        allowedAttributes: {},
      });
    }
    if (typeof payload.isHidden === 'boolean') data.isHidden = payload.isHidden;
    if (Object.keys(data).length === 0) return;
    await this._prisma.comment.update({ where: { id }, data });
  }

  async hide(id: string): Promise<void> {
    await this._prisma.comment.update({
      where: { id },
      data: { isHidden: true },
    });
  }

  async unhide(id: string): Promise<void> {
    await this._prisma.comment.update({
      where: { id },
      data: { isHidden: false },
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
      where['textContent'] = {
        contains: searchQuery,
        mode: 'insensitive',
      };
    }

    if (sortState) {
      orderBy = sortState;
    }

    const items: Comment[] = await this._prisma.comment.findMany({
      where: {
        ...where,
      },
      orderBy: {
        ...orderBy,
      },
      include: {
        author: true,
        publication: true,
      },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });
    const totalItems = await this._prisma.comment.count();
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
    const comment = await this.findOneById(id);

    if (!comment) {
      return;
    }

    if (comment.publicationId) {
      await this._prisma.publication.update({
        where: {
          id: comment.publicationId,
        },
        data: {
          commentsCount: { decrement: 1 },
        },
      });
    }

    if (comment.lessonId) {
      await this._prisma.lesson.update({
        where: {
          id: comment.lessonId,
        },
        data: {
          commentsCount: { decrement: 1 },
        },
      });

      const lesson: any = await this._prisma.lesson.findUnique({
        where: { id: comment.lessonId },
        include: {
          sectionItem: { include: { section: true } },
        },
      });
      const tutorialId =
        lesson?.tutorialId || lesson?.sectionItem?.section?.tutorialId;
      if (tutorialId) {
        await this._prisma.tutorial.update({
          where: { id: tutorialId },
          data: {
            commentsCount: { decrement: 1 },
          },
        });
      }
    }

    const childrenComments = await this._prisma.comment.findMany({
      where: {
        respondingToId: comment.id,
      },
    });

    for (const childComment of childrenComments) {
      await this.delete(childComment.id);
    }

    await this._prisma.comment.delete({
      where: {
        id,
      },
    });
  }
}
