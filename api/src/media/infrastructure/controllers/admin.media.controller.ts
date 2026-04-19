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
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { Response } from 'express';
import axios from 'axios';
import archiver from 'archiver';
import { FileInterceptor } from '@nestjs/platform-express';
import { UPLOAD_FILE_PIPE_BUILDER } from '@/common/infrastructure/validators/profile-avatar-upload.pipe-builder';
import { FileStorageService } from '@/platform/application/services/file-storage.service';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { MediaItemsDataTableService } from '@/media/application/services/media-items-data-table.service';
import { MediaViewDto } from '@/media/application/dtos/media-view.dto';

@Controller('admin/media')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminMediaController {
  constructor(
    private prisma: PrismaService,
    private fileStorage: FileStorageService,
    private mediaDataTable: MediaItemsDataTableService,
  ) {}

  @Get('list')
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async list(@Req() req: any) {
    const files = await this.prisma.mediaItem.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      files,
      mediaView: req.user.mediaView,
    };
  }

  @Post('table')
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async table(@Body() dto: DataTableQueryDto) {
    // Admin sees all files without user scope
    return await this.mediaDataTable.query(dto);
  }

  @Post('view')
  @CheckAbilities([Action.Update, 'AdminPanel'])
  async saveView(@Req() req: any, @Body() dto: MediaViewDto) {
    await this.prisma.user.update({
      where: { id: req.user.id },
      data: { mediaView: dto.mediaView },
    });
    return {};
  }

  @Post('upload')
  @CheckAbilities([Action.Create, 'AdminPanel'])
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req: any,
    @UploadedFile(UPLOAD_FILE_PIPE_BUILDER) uploadedFile: Express.Multer.File,
  ) {
    const file = await this.fileStorage.save(uploadedFile, req.user);
    return { file };
  }

  @Post('download')
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async zip(@Res() res: Response, @Body() body: { ids: string[] }) {
    const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
    if (!ids.length) {
      res.status(400).json({ message: 'ids is required' });
      return;
    }

    // Get files by ids without user ownership restriction
    const items = await this.prisma.mediaItem.findMany({
      where: { id: { in: ids } },
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
        const msg = `Failed to include ${finalName} - download error.`;
        archive.append(Buffer.from(msg, 'utf8'), {
          name: `${finalName}.ERROR.txt`,
        });
      }
    }

    await archive.finalize();
  }

  @Post('delete')
  @CheckAbilities([Action.Delete, 'AdminPanel'])
  async deleteSelected(@Body() body: { ids: string[] }) {
    const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
    if (!ids.length) {
      return { deletedIds: [], skippedIds: [], message: 'ids is required' };
    }

    // Admin can delete any items directly by ids
    const items = await this.prisma.mediaItem.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    const existingIds = new Set<string>(items.map((i) => i.id));
    const toDelete = [...existingIds];
    const skipped = ids.filter((id) => !existingIds.has(id));

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
