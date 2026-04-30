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

  async transcodeBufferToHls(
    buffer: Buffer,
    extension: string,
    dimensions?: { width: number; height: number },
  ): Promise<{
    tempDir: string;
    hlsDir: string;
    m3u8File: string;
    thumbnailFile: string | null;
    metadata: any;
  } | null> {
    const transcodingId = crypto.randomUUID();
    const tempDir = join(process.cwd(), 'temp', 'transcoding', transcodingId);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    const inputPath = join(tempDir, `input.${extension}`);
    fs.writeFileSync(inputPath, buffer);

    const outputDir = join(tempDir, 'hls');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const m3u8Path = join(outputDir, 'stream.m3u8');
    const thumbnailFile = 'thumbnail.jpg';
    const thumbnailPath = join(tempDir, thumbnailFile);

    try {
      this.logger.log(
        `Starting transcoding to HLS for buffer (extension: ${extension}, size: ${buffer.length})...`,
      );

      const metadata: any = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, data) => {
          if (err) {
            this.logger.error(`ffprobe error: ${err.message}`);
            reject(err);
          } else {
            const videoStream = data.streams.find(
              (s) => s.codec_type === 'video',
            );
            resolve({
              width: videoStream?.width,
              height: videoStream?.height,
              duration: data.format.duration,
              bitrate: data.format.bit_rate,
            });
          }
        });
      });

      this.logger.log(`Input metadata: ${JSON.stringify(metadata)}`);

      // Generate thumbnail
      const thumbnailSize = dimensions
        ? `${dimensions.width}x${dimensions.height}`
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
            '-c:v libx264',
            '-profile:v main',
            '-level:v 3.0',
            '-pix_fmt yuv420p',
            '-maxrate 2000k',
            '-bufsize 4000k',
            '-crf 23',
            '-c:a aac',
            '-b:a 128k',
            '-f hls',
            '-hls_time 6',
            '-hls_playlist_type vod',
            '-hls_segment_filename',
            join(outputDir, 'segment-%03d.ts'),
          ])
          .output(m3u8Path)
          .on('end', () => {
            this.logger.log(`Transcoding finished: ${m3u8Path}`);
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
        hlsDir: outputDir,
        m3u8File: 'stream.m3u8',
        thumbnailFile: fs.existsSync(thumbnailPath) ? thumbnailFile : null,
        metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to transcode buffer: ${error.message}`);
      fs.rmSync(tempDir, { recursive: true, force: true });
      return null;
    }
  }

  async transcodeToHls(mediaItemId: string) {
    this.logger.log(`Starting transcodeToHls for media item: ${mediaItemId}`);
    try {
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

      const transcodeResult = await this.transcodeBufferToHls(
        fileContent,
        mediaItem.extension,
        dimensions,
      );

      if (transcodeResult) {
        const { tempDir, hlsDir, m3u8File, thumbnailFile, metadata } =
          transcodeResult;
        try {
          const hlsFiles = fs.readdirSync(hlsDir);
          const hlsTargetFolder = 'hls-' + crypto.randomUUID();

          const updatedPayload = {
            ...payload,
            ...metadata,
            hls: {
              manifest: '',
            },
          };

          const writeOptions = mediaItem.fileStorageProvider.useAcl
            ? {
                visibility: 'public' as any,
              }
            : null;

          this.logger.log(`HLS files found: ${hlsFiles.join(', ')}`);
          this.logger.log(`Targeting manifest: ${m3u8File}`);

          for (const file of hlsFiles) {
            const filePath = join(hlsDir, file);
            const fileBuffer = fs.readFileSync(filePath);
            const targetPath = join(hlsTargetFolder, file).replace(/\\/g, '/');
            await storage.write(targetPath, fileBuffer, writeOptions);

            if (file === m3u8File) {
              const publicUrl = await storage.publicUrl(targetPath);
              this.logger.log(`M3U8 Public URL: ${publicUrl}`);
              updatedPayload.hls.manifest = publicUrl.replace(/\\/g, '/');
            }
          }

          let thumbnailUrl = mediaItem.thumbnailUrl;
          const manifestUrl = updatedPayload.hls.manifest;

          if (thumbnailFile) {
            const thumbnailPath = join(tempDir, thumbnailFile);
            const thumbnailBuffer = fs.readFileSync(thumbnailPath);
            const targetThumbnailPath = join(
              hlsTargetFolder,
              thumbnailFile,
            ).replace(/\\/g, '/');
            await storage.write(
              targetThumbnailPath,
              thumbnailBuffer,
              writeOptions,
            );
            thumbnailUrl = (
              await storage.publicUrl(targetThumbnailPath)
            ).replace(/\\/g, '/');
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
        } finally {
          // Cleanup temp files
          if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to transcode media item ${mediaItemId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
