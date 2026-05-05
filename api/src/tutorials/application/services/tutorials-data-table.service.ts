import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import {
  DataTableConfig,
  DataTableQueryDto,
  DataTableResponseDto,
} from '@/platform/application/dtos/datatable-dto';

const config: DataTableConfig = {
  entity: 'tutorial',
  defaultSortBy: 'updatedAt',
  defaultSortDir: 'desc',
  columns: [
    {
      key: 'id',
      filterable: true,
      searchable: false,
      type: 'string',
      width: 120,
      pinned: 'left',
    },
    {
      key: 'title',
      filterable: true,
      searchable: true,
      type: 'string',
      width: 280,
    },
    {
      key: 'statusId',
      filterable: true,
      searchable: false,
      type: 'string',
      width: 140,
    },
    {
      key: 'authorId',
      filterable: true,
      searchable: false,
      type: 'string',
      width: 180,
    },
    {
      key: 'createdAt',
      filterable: true,
      searchable: false,
      type: 'datetime',
      width: 180,
    },
  ],
};

@Injectable()
export class TutorialsDataTableService extends DataTableService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, config);
  }

  /**
   * Studio requirement: show only one row per tutorial root. When navigating to edit,
   * open a draft if it exists; otherwise open the published version; otherwise the root draft.
   * This method builds a "root view" with computed fields editId, draftId, publishedId.
   */
  async query(dto: DataTableQueryDto): Promise<DataTableResponseDto<any>> {
    const { page = 1, pageSize = 50, q } = this.normalizeQuery(dto);
    const skip = (page - 1) * pageSize;

    // Roots: those having any versions (self-included) OR legacy rows without rootId
    const whereRoot: any = {
      OR: [
        { versions: { some: {} } },
        { rootId: null },
        { revision: 1 }, // treat initial version as root to include single-version tutorials
      ],
    };
    if (q && q.trim()) {
      whereRoot.title = { contains: q.trim(), mode: 'insensitive' };
    }

    // Count roots
    const total = await (this.prisma as any).tutorial.count({ where: whereRoot });

    // Load page of roots with their versions
    const roots = await (this.prisma as any).tutorial.findMany({
      where: whereRoot,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        status: true,
        channel: true,
        author: true,
        versions: {
          include: { status: true, channel: true, author: true },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    const data = roots.map((root: any) => {
      // Candidate versions include root itself (because rootId usually points to self)
      const candidates: any[] = [root, ...(root.versions || [])];
      // Working version: first look for 'unpublishedChanges', then regular 'draft'
      const working =
        candidates.find((v) => v.status?.type === 'unpublishedChanges') ||
        candidates.find((v) => v.status?.type === 'draft') ||
        null;
      const published = candidates.find((v) => v.status?.type === 'published') || null;
      const display = working || published || root;
      const editId = working?.id || published?.id || root.id;

      return {
        // Core identifiers
        id: display.id,
        rootId: root.id,
        // For backward compatibility, keep draftId as the working version id, if it exists
        draftId: working?.id ?? null,
        publishedId: published?.id ?? null,
        editId,

        // Fields for columns (take from display version)
        title: display.title,
        statusId: display.statusId,
        status: display.status,
        authorId: display.authorId,
        createdAt: display.createdAt,
        updatedAt: display.updatedAt,
        publishedAt: display.publishedAt ?? null,
        channel: display.channel ?? null,
        author: display.author ?? null,
        slug: display.slug ?? null,
      };
    });

    return { data, total, page, pageSize };
  }
}
