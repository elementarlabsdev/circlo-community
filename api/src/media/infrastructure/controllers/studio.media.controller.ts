import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { Response } from 'express';
import axios from 'axios';
import archiver from 'archiver';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudioMediaUploadPipe } from '@/common/infrastructure/validators/studio-media-upload.pipe';
import { FileStorageService } from '@/platform/application/services/file-storage.service';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { MediaItemsDataTableService } from '@/media/application/services/media-items-data-table.service';
import { MediaViewDto } from '@/media/application/dtos/media-view.dto';

@Controller('studio/media')
@UseGuards(AuthGuard)
export class StudioMediaController {
  constructor(
    private prisma: PrismaService,
    private fileStorage: FileStorageService,
    private mediaDataTable: MediaItemsDataTableService,
  ) {}

  @Get('list')
  async list(@Req() req: any) {
    const files = await this.prisma.mediaItem.findMany({
      where: {
        uploadedBy: {
          id: req.user.id,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      files,
      mediaView: req.user.mediaView,
    };
  }

  @Post('table')
  async table(@Req() req: any, @Body() dto: DataTableQueryDto) {
    return await this.mediaDataTable.queryForUser(dto, req.user.id);
  }

  @Post('view')
  async saveView(@Req() req: any, @Body() dto: MediaViewDto) {
    await this.prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        mediaView: dto.mediaView,
      },
    });
    return {};
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req: any,
    @UploadedFile(StudioMediaUploadPipe) uploadedFile: Express.Multer.File,
  ) {
    const file = await this.fileStorage.save(uploadedFile, req.user);
    return {
      file,
    };
  }

  @Post('download')
  async zip(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: { ids: string[] },
  ) {
    const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
    if (!ids.length) {
      res.status(400).json({ message: 'ids is required' });
      return;
    }

    // Get only files belonging to the current user
    const items = await this.prisma.mediaItem.findMany({
      where: { id: { in: ids }, uploadedBy: { id: req.user.id } },
      orderBy: { createdAt: 'desc' },
    });

    if (!items.length) {
      res.status(404).json({ message: 'No files found' });
      return;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
    const filename = `media-${items.length}-${stamp}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', () => {
      try {
        if (!res.headersSent) res.status(500);
      } catch {}
      res.end();
    });

    // Pipe archive to response
    archive.pipe(res);

    const usedNames = new Set<string>();
    const sanitize = (name: string) =>
      (name || 'file').replace(/[\/:*?"<>|\x00-\x1F]/g, '_').slice(0, 180);
    const makeUnique = (base: string) => {
      let n = base;
      let i = 1;
      while (usedNames.has(n)) {
        const dot = base.lastIndexOf('.');
        if (dot > 0) {
          n = base.slice(0, dot) + ` (${i})` + base.slice(dot);
        } else {
          n = base + ` (${i})`;
        }
        i++;
      }
      usedNames.add(n);
      return n;
    };

    for (const item of items) {
      const ext = item.extension ? `.${item.extension}` : '';
      const safe = sanitize(item.name?.toString() || `file${ext}`);
      const finalName = makeUnique(
        safe.endsWith(ext) || !ext ? safe : `${safe}${ext}`,
      );
      try {
        const response = await axios.get(item.url, { responseType: 'stream' });
        archive.append(response.data, { name: finalName });
      } catch {
        // If a file fails to fetch, include a small text note instead to indicate failure
        const msg = `Failed to include ${finalName} - download error.`;
        archive.append(Buffer.from(msg, 'utf8'), {
          name: `${finalName}.ERROR.txt`,
        });
      }
    }

    await archive.finalize();
  }

  @Post('delete')
  async deleteSelected(@Req() req: any, @Body() body: { ids: string[] }) {
    const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
    if (!ids.length) {
      return { deletedIds: [], skippedIds: [], message: 'ids is required' };
    }

    // only items owned by the user
    const items = await this.prisma.mediaItem.findMany({
      where: { id: { in: ids }, uploadedBy: { id: req.user.id } },
      select: { id: true },
    });
    const ownedIds = new Set<string>(items.map((i) => i.id));
    const toDelete = [...ownedIds];
    const skipped = ids.filter((id) => !ownedIds.has(id));

    const deletedIds: string[] = [];
    const failedIds: string[] = [];
    for (const id of toDelete) {
      try {
        await this.fileStorage.delete(id);
        deletedIds.push(id);
      } catch {
        failedIds.push(id);
      }
    }

    return { deletedIds, skippedIds: skipped, failedIds };
  }
}
