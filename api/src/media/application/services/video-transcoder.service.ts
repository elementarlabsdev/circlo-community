import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { FileStorageService } from '@/platform/application/services/file-storage.service';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { FileCategory } from '@/platform/application/utils/get-file-category';

@Injectable()
export class VideoTranscoderService {
  private readonly logger = new Logger(VideoTranscoderService.name);

  constructor(
    @Inject(forwardRef(() => FileStorageService))
    private readonly fileStorage: FileStorageService,
    private readonly prisma: PrismaService,
  ) {}

  async transcodeBufferToDash(
    buffer: Buffer,
    extension: string,
  ): Promise<{ tempDir: string; dashDir: string; mpdFile: string } | null> {
    const transcodingId = crypto.randomUUID();
    const tempDir = join(process.cwd(), 'temp', 'transcoding', transcodingId);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    const inputPath = join(tempDir, `input.${extension}`);
    fs.writeFileSync(inputPath, buffer);

    const outputDir = join(tempDir, 'dash');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const mpdPath = join(outputDir, 'stream.mpd');

    try {
      this.logger.log(
        `Starting transcoding for buffer (extension: ${extension}, size: ${buffer.length})...`,
      );

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions([
            '-map 0',
            '-c:v libx264',
            '-c:a aac',
            '-f dash',
            '-seg_duration 4',
            '-use_timeline 1',
            '-use_template 1',
            '-init_seg_name init-$RepresentationID$.m4s',
            '-media_seg_name chunk-$RepresentationID$-$Number%05d$.m4s',
          ])
          .output(mpdPath)
          .on('end', () => {
            this.logger.log(`Transcoding finished: ${mpdPath}`);
            resolve(true);
          })
          .on('error', (err) => {
            this.logger.error(`Transcoding error: ${err.message}`);
            reject(err);
          })
          .run();
      });

      return {
        tempDir,
        dashDir: outputDir,
        mpdFile: 'stream.mpd',
      };
    } catch (error) {
      this.logger.error(`Failed to transcode buffer: ${error.message}`);
      fs.rmSync(tempDir, { recursive: true, force: true });
      return null;
    }
  }

  async transcodeToDash(mediaItemId: string) {
    this.logger.log(`Starting transcodeToDash for media item: ${mediaItemId}`);
    const mediaItem = await this.prisma.mediaItem.findUnique({
      where: { id: mediaItemId },
      include: { fileStorageProvider: true },
    });

    if (!mediaItem || mediaItem.category !== FileCategory.Video) {
      this.logger.warn(
        `Media item ${mediaItemId} not found or is not a video. Category: ${mediaItem?.category}`,
      );
      return;
    }

    const storage = await this.fileStorage.getStorageInstance(
      mediaItem.fileStorageProvider,
    );
    const fileContent = await storage.readToBuffer(mediaItem.path);

    const transcodeResult = await this.transcodeBufferToDash(
      fileContent,
      mediaItem.extension,
    );

    if (transcodeResult) {
      const { tempDir, dashDir, mpdFile } = transcodeResult;
      const dashFiles = fs.readdirSync(dashDir);
      const dashTargetFolder = 'dash-' + crypto.randomUUID();

      const payload = {
        ...((mediaItem.payload as any) || {}),
        dash: {
          manifest: '',
        },
      };

      const writeOptions = mediaItem.fileStorageProvider.useAcl
        ? {
            visibility: 'public' as any,
          }
        : null;

      this.logger.log(`DASH files found: ${dashFiles.join(', ')}`);
      this.logger.log(`Targeting manifest: ${mpdFile}`);

      for (const file of dashFiles) {
        const filePath = join(dashDir, file);
        const fileBuffer = fs.readFileSync(filePath);
        const targetPath = join(dashTargetFolder, file).replace(/\\/g, '/');
        await storage.write(targetPath, fileBuffer, writeOptions);

        if (file === mpdFile) {
          const publicUrl = await storage.publicUrl(targetPath);
          this.logger.log(`MPD Public URL: ${publicUrl}`);
          payload.dash.manifest = publicUrl.replace(/\\/g, '/');
        }
      }

      this.logger.log(`Final payload: ${JSON.stringify(payload)}`);

      await this.prisma.mediaItem.update({
        where: { id: mediaItemId },
        data: { payload },
      });

      // Cleanup temp files
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}
