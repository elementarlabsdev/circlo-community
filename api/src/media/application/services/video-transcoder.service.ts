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

  async optimizeVideo(buffer: Buffer, extension: string): Promise<Buffer> {
    const transcodingId = crypto.randomUUID();
    const tempDir = join(process.cwd(), 'temp', 'optimize', transcodingId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const inputPath = join(tempDir, `input.${extension}`);
    const outputPath = join(tempDir, `output.${extension}`);
    fs.writeFileSync(inputPath, buffer);

    try {
      this.logger.log(`Optimizing video: ${inputPath}`);
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions(['-c copy', '-movflags +faststart'])
          .save(outputPath)
          .on('end', () => {
            this.logger.log(`Optimization finished: ${outputPath}`);
            resolve(true);
          })
          .on('error', (err) => {
            this.logger.error(`Optimization error: ${err.message}`);
            reject(err);
          });
      });

      const optimizedBuffer = fs.readFileSync(outputPath);
      return optimizedBuffer;
    } catch (error) {
      this.logger.error(`Failed to optimize video: ${error.message}`);
      return buffer; // Return original buffer if optimization fails
    } finally {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  }

  async transcodeBufferToDash(
    buffer: Buffer,
    extension: string,
    dimensions?: { width: number; height: number },
  ): Promise<{
    tempDir: string;
    dashDir: string;
    mpdFile: string;
    thumbnailFile: string | null;
  } | null> {
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
    const thumbnailFile = 'thumbnail.jpg';
    const thumbnailPath = join(tempDir, thumbnailFile);

    try {
      this.logger.log(
        `Starting transcoding for buffer (extension: ${extension}, size: ${buffer.length})...`,
      );

      // Generate thumbnail
      const thumbnailSize = dimensions
        ? dimensions.width >= dimensions.height
          ? '1280x?'
          : '?x1280'
        : '1280x720';

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .screenshots({
            timestamps: ['00:00:00'],
            filename: thumbnailFile,
            folder: tempDir,
            size: thumbnailSize,
          })
          .on('end', () => {
            this.logger.log(`Thumbnail generated: ${thumbnailPath}`);
            resolve(true);
          })
          .on('error', (err) => {
            this.logger.error(`Thumbnail generation error: ${err.message}`);
            resolve(false); // Non-critical error
          });
      });

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
        thumbnailFile: fs.existsSync(thumbnailPath) ? thumbnailFile : null,
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

    const payload = (mediaItem.payload as any) || {};
    const dimensions =
      payload.width && payload.height
        ? { width: payload.width, height: payload.height }
        : undefined;

    const transcodeResult = await this.transcodeBufferToDash(
      fileContent,
      mediaItem.extension,
      dimensions,
    );

    if (transcodeResult) {
      const { tempDir, dashDir, mpdFile, thumbnailFile } = transcodeResult;
      const dashFiles = fs.readdirSync(dashDir);
      const dashTargetFolder = 'dash-' + crypto.randomUUID();

      const updatedPayload = {
        ...payload,
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
          updatedPayload.dash.manifest = publicUrl.replace(/\\/g, '/');
        }
      }

      let thumbnailUrl = mediaItem.thumbnailUrl;
      const manifestUrl = updatedPayload.dash.manifest;

      if (thumbnailFile) {
        const thumbnailPath = join(tempDir, thumbnailFile);
        const thumbnailBuffer = fs.readFileSync(thumbnailPath);
        const targetThumbnailPath = join(
          dashTargetFolder,
          thumbnailFile,
        ).replace(/\\/g, '/');
        await storage.write(targetThumbnailPath, thumbnailBuffer, writeOptions);
        thumbnailUrl = (await storage.publicUrl(targetThumbnailPath)).replace(
          /\\/g,
          '/',
        );
        this.logger.log(`Thumbnail Public URL: ${thumbnailUrl}`);
      }

      this.logger.log(`Final payload: ${JSON.stringify(updatedPayload)}`);

      await this.prisma.mediaItem.update({
        where: { id: mediaItemId },
        data: {
          payload: updatedPayload,
          thumbnailUrl,
          url: manifestUrl,
        },
      });

      // Delete original file after successful transcoding
      try {
        await this.fileStorage.deleteMediaItem(mediaItem as any);
        this.logger.log(`Original file deleted: ${mediaItem.path}`);
      } catch (error) {
        this.logger.error(
          `Failed to delete original file ${mediaItem.path}: ${error.message}`,
        );
      }

      // Cleanup temp files
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}
