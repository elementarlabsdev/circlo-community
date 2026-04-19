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
    // This method is now obsolete as transcoding is done during upload
    this.logger.warn(
      `transcodeToDash called for ${mediaItemId}, but it's now obsolete`,
    );
    return;
  }
}
