import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { CommentsRepositoryInterface } from '../../domain/repositories/comments.repository';
import { Comment } from '../../domain/entities/comment.entity';
import { MarkdownService } from '@/common/infrastructure/markdown/markdown.service';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class CommentsPrismaRepository implements CommentsRepositoryInterface {
  constructor(
    private readonly prisma: PrismaService,
    private readonly markdown: MarkdownService,
  ) {}

  private map(row: any): Comment {
    return Comment.fromPersistence(row);
  }

  private sanitize(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: [
        'b',
        'i',
        'strong',
        'img',
        'a',
        'span',
        'pre',
        'code',
        'p',
        'br',
        'ul',
        'ol',
        'li',
      ],
      allowedAttributes: {
        span: ['style', 'class'],
        code: ['class'],
        pre: ['style', 'class'],
        a: ['href', 'name', 'target'],
        img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
      },
    });
  }

  private stripHtml(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: [],
      allowedAttributes: {},
    });
  }

  async setHidden(id: string, hidden: boolean): Promise<void> {
    await this.prisma.comment.update({
      where: { id },
      data: { isHidden: hidden },
    });
  }

  async findAllByPublicationId(publicationId: string): Promise<Comment[]> {
    const rows = await this.prisma.comment.findMany({
      where: {
        publication: { id: publicationId },
        depth: 0,
      },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => this.map(r));
  }

  async findAllByLessonId(lessonId: string): Promise<Comment[]> {
    const rows = await this.prisma.comment.findMany({
      where: {
        lesson: { id: lessonId },
        depth: 0,
      },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => this.map(r));
  }

  async findRepliesOf(commentId: string): Promise<Comment[]> {
    const rows = await this.prisma.comment.findMany({
      where: {
        respondingTo: { id: commentId },
      },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => this.map(r));
  }

  async findByIdOrFail(id: string): Promise<Comment> {
    const row = await this.prisma.comment.findUniqueOrThrow({
      where: { id },
      include: { author: true, publication: true, lesson: true },
    });
    return this.map(row);
  }

  async createRoot(
    publicationId: string,
    content: string,
    authorId: string,
  ): Promise<Comment> {
    const htmlContent = await this.markdown.highlightCode(content);
    const row = await this.prisma.comment.create({
      data: {
        publication: { connect: { id: publicationId } },
        htmlContent: this.sanitize(htmlContent),
        textContent: this.stripHtml(content),
        author: { connect: { id: authorId } },
        createdAt: new Date(),
      },
      include: { author: true },
    });
    return this.map(row);
  }

  async createRootForLesson(
    lessonId: string,
    content: string,
    authorId: string,
  ): Promise<Comment> {
    const htmlContent = await this.markdown.highlightCode(content);
    const row = await this.prisma.comment.create({
      data: {
        lesson: { connect: { id: lessonId } },
        htmlContent: this.sanitize(htmlContent),
        textContent: this.stripHtml(content),
        author: { connect: { id: authorId } },
        createdAt: new Date(),
      },
      include: { author: true },
    });
    return this.map(row);
  }

  async incrementPublicationComments(
    publicationId: string,
    delta: number,
  ): Promise<void> {
    await this.prisma.publication.update({
      where: { id: publicationId },
      data: { commentsCount: { increment: delta } as any },
    });
  }

  async incrementLessonComments(
    lessonId: string,
    delta: number,
  ): Promise<void> {
    await this.prisma.lesson.update({
      where: { id: lessonId },
      data: { commentsCount: { increment: delta } as any },
    });
  }

  async incrementTutorialComments(
    tutorialId: string,
    delta: number,
  ): Promise<void> {
    await this.prisma.tutorial.update({
      where: { id: tutorialId },
      data: { commentsCount: { increment: delta } as any },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } });
  }

  async createReply(
    respondingTo: Comment,
    content: string,
    authorId: string,
  ): Promise<Comment> {
    const htmlContent = await this.markdown.highlightCode(content);
    const row = await this.prisma.comment.create({
      data: {
        ...(respondingTo.publication?.id || respondingTo.publicationId
          ? {
              publication: {
                connect: {
                  id:
                    respondingTo.publication?.id ||
                    (respondingTo as any).publicationId,
                },
              },
            }
          : {
              lesson: {
                connect: {
                  id:
                    (respondingTo as any).lesson?.id ||
                    (respondingTo as any).lessonId,
                },
              },
            }),
        htmlContent: this.sanitize(htmlContent),
        textContent: this.stripHtml(content),
        depth: (respondingTo.depth ?? 0) + 1,
        author: { connect: { id: authorId } },
        respondingTo: { connect: { id: respondingTo.id } },
        createdAt: new Date(),
      },
      include: { author: true },
    });
    return this.map(row);
  }

  async updateRepliesCount(commentId: string, delta: number): Promise<void> {
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { repliesCount: { increment: delta } as any },
    });
  }
}
