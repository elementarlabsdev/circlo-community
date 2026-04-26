import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { FileStorageService } from '@/platform/application/services/file-storage.service';
import { PrismaService } from '@/platform/application/services/prisma.service';

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
      this.logger.log(`Starting transcoding for buffer...`);

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
    const mediaItem = await this.prisma.mediaItem.findUnique({
      where: { id: mediaItemId },
      include: { fileStorageProvider: true },
    });

    if (!mediaItem || mediaItem.category !== 'Video') {
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

      const payload = (mediaItem.payload as any) || {};
      payload.dash = {
        manifest: '',
        files: [],
      };

      const writeOptions = mediaItem.fileStorageProvider.useAcl
        ? {
            visibility: 'public' as any,
          }
        : null;

      for (const file of dashFiles) {
        const filePath = join(dashDir, file);
        const fileBuffer = fs.readFileSync(filePath);
        const targetPath = join(dashTargetFolder, file);
        await storage.write(targetPath, fileBuffer, writeOptions);

        if (file === mpdFile) {
          const publicUrl = await storage.publicUrl(targetPath);
          payload.dash.manifest = publicUrl.replace(/\\/g, '/');
        }
      }

      await this.prisma.mediaItem.update({
        where: { id: mediaItemId },
        data: { payload },
      });

      // Cleanup temp files
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}
