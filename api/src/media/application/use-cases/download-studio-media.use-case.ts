import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { Response } from 'express';
import axios from 'axios';
import archiver from 'archiver';

@Injectable()
export class DownloadStudioMediaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, ids: string[], res: Response) {
    const validIds = Array.isArray(ids) ? ids.filter(Boolean) : [];
    if (!validIds.length) {
      res.status(400).json({ message: 'ids is required' });
      return;
    }

    // Get only files belonging to the current user
    const items = await this.prisma.mediaItem.findMany({
      where: { id: { in: validIds }, uploadedBy: { id: userId } },
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
}
