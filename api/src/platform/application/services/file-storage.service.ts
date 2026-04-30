import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import { FileStorage, Visibility } from '@flystorage/file-storage';
import { extname } from 'path';
import * as crypto from 'crypto';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { AwsS3StorageAdapter } from '@flystorage/aws-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { FileStorageProvider, User } from '@prisma/client';
import {
  FileCategory,
  getFileCategoryByMimeType,
} from '@/platform/application/utils/get-file-category';
import { getMediaMetadata } from '@/platform/application/utils/get-media-metadata';
import {
  FileStorageModuleOptions,
  MODULE_OPTIONS_TOKEN,
} from '@/platform/domain/types/file-storage.types';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { VideoTranscoderService } from '@/media/application/services/video-transcoder.service';

import { SettingsService } from '@/settings/application/services/settings.service';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private _storage: FileStorage | null = null;
  private fileStorageProvider: FileStorageProvider;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private _options: FileStorageModuleOptions,
    private _prisma: PrismaService,
    @Optional()
    @InjectQueue('video-transcoding')
    private readonly videoTranscodingQueue?: Queue,
    @Inject(forwardRef(() => VideoTranscoderService))
    private readonly videoTranscoder?: VideoTranscoderService,
    private readonly settings?: SettingsService,
  ) {}

  private async ensureStorage(): Promise<void> {
    const fileStorageProvider =
      await this._prisma.fileStorageProvider.findFirstOrThrow({
        where: { isConfigured: true, isDefault: true },
      });

    this.fileStorageProvider = fileStorageProvider;
    this._storage = this.getStorageInstance(fileStorageProvider);
  }

  public getStorageInstance(
    fileStorageProvider: FileStorageProvider,
  ): FileStorage {
    let storage = new FileStorage(this._options.adapters['local']);

    if (fileStorageProvider.type === 'aws-s3') {
      storage = this.configureAwsS3Adapter(fileStorageProvider);
    } else if (fileStorageProvider.type === 'digitalocean') {
      storage = this.configureDigitalOceanSpacesAdapter(fileStorageProvider);
    } else if (fileStorageProvider.type === 'hetzner') {
      storage = this.configureHetznerObjectStorageAdapter(fileStorageProvider);
    }

    return storage;
  }

  async save(uploadedFile: Express.Multer.File, uploadedBy: User) {
    await this.ensureStorage();

    let extension = extname(uploadedFile.originalname.toLowerCase())
      .split('.')
      .pop();

    if (!extension) {
      extension = uploadedFile.mimetype.toLowerCase().split('/')[1];
    }
    const newFilePath = crypto.randomUUID() + '.' + extension;
    const category = getFileCategoryByMimeType(uploadedFile.mimetype);

    let fileBuffer = uploadedFile.buffer;
    if (category === FileCategory.Video && this.videoTranscoder) {
      this.logger.log(
        `Optimizing video before upload: ${uploadedFile.originalname}`,
      );
      fileBuffer = await this.videoTranscoder.optimizeVideo(
        fileBuffer,
        extension,
      );
    }

    const writeOptions = this.fileStorageProvider.useAcl
      ? {
          visibility: Visibility.PUBLIC,
        }
      : null;
    await this._storage.write(newFilePath, fileBuffer, writeOptions);

    const payload: any =
      (await getMediaMetadata(fileBuffer, uploadedFile.mimetype)) || {};

    const orientation = payload.orientation;
    const mediaItem = await this._prisma.mediaItem.create({
      data: {
        name: uploadedFile.originalname || crypto.randomUUID(),
        mimeType: uploadedFile.mimetype,
        category,
        type: category,
        size: fileBuffer.length,
        payload: payload || null,
        orientation,
        fileStorageProvider: {
          connect: {
            id: this.fileStorageProvider.id,
          },
        },
        extension,
        path: newFilePath,
        url: await this._storage.publicUrl(newFilePath),
        uploadedBy: {
          connect: {
            id: uploadedBy.id,
          },
        },
      },
    });

    const maxSizeForTranscodingMb = this.settings
      ? await this.settings.findValueByName('maxSizeForTranscoding', 100)
      : 100;
    const maxDurationForTranscodingMin = this.settings
      ? await this.settings.findValueByName('maxDurationForTranscoding', 10)
      : 10;
    const maxSizeForTranscoding = maxSizeForTranscodingMb * 1024 * 1024;
    const maxDurationForTranscoding = maxDurationForTranscodingMin * 60;
    const isLargeFile = fileBuffer.length > maxSizeForTranscoding;
    const isLongVideo = payload?.duration > maxDurationForTranscoding;

    if (
      category === FileCategory.Video &&
      (isLargeFile || isLongVideo) &&
      this.videoTranscodingQueue
    ) {
      this.logger.log(
        `Adding video transcoding job for media item: ${mediaItem.id}`,
      );
      try {
        await this.videoTranscodingQueue.add('video-transcoding', {
          mediaItemId: mediaItem.id,
        });
        this.logger.log(
          `Video transcoding job added successfully: ${mediaItem.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to add video transcoding job for media item: ${mediaItem.id}. Error: ${error.message}`,
        );
      }
    }

    return mediaItem;
  }

  async delete(id: string): Promise<void> {
    const mediaItem = await this._prisma.mediaItem.findUnique({
      where: { id },
      include: { fileStorageProvider: true },
    });

    if (!mediaItem) {
      return;
    }

    await this.deleteMediaItem(
      mediaItem as any as {
        path: string;
        fileStorageProvider: FileStorageProvider;
      },
    );
    await this._prisma.mediaItem.delete({ where: { id } });
  }

  async deleteMediaItem(mediaItem: {
    path: string;
    fileStorageProvider: FileStorageProvider;
  }): Promise<void> {
    const storage = this.getStorageInstance(mediaItem.fileStorageProvider);
    try {
      await storage.deleteFile(mediaItem.path);
    } catch {}
  }

  private configureAwsS3Adapter(
    fileStorageProvider: FileStorageProvider,
  ): FileStorage {
    const clientConfig = {
      region: fileStorageProvider.region,
      forcePathStyle: false,
      credentials: {
        accessKeyId: fileStorageProvider.accessKeyId,
        secretAccessKey: fileStorageProvider.secretAccessKey,
      },
    };
    const client = new S3Client(clientConfig);
    const adapter = new AwsS3StorageAdapter(client, {
      bucket: fileStorageProvider.bucket,
      prefix: '',
    });
    return new FileStorage(adapter);
  }

  private configureDigitalOceanSpacesAdapter(
    fileStorageProvider: FileStorageProvider,
  ): FileStorage {
    const clientConfig = {
      region: fileStorageProvider.region,
      forcePathStyle: false,
      endpoint: `https://${fileStorageProvider.region}.digitaloceanspaces.com`,
      credentials: {
        accessKeyId: fileStorageProvider.accessKeyId,
        secretAccessKey: fileStorageProvider.secretAccessKey,
      },
    };
    const client = new S3Client(clientConfig);
    const adapter = new AwsS3StorageAdapter(
      client,
      {
        bucket: fileStorageProvider.bucket,
        prefix: '',
      },
      {
        publicUrl(path: string): Promise<string> {
          const publicUrl = fileStorageProvider.cdnEnabled
            ? `https://${fileStorageProvider.bucket}.${fileStorageProvider.region}.cdn.digitaloceanspaces.com/${path}`
            : `https://${fileStorageProvider.bucket}.${fileStorageProvider.region}.digitaloceanspaces.com/${path}`;
          return Promise.resolve(publicUrl);
        },
      },
    );
    return new FileStorage(adapter);
  }

  private configureHetznerObjectStorageAdapter(
    fileStorageProvider: FileStorageProvider,
  ): FileStorage {
    const clientConfig = {
      region: fileStorageProvider.region,
      endpoint: `https://${fileStorageProvider.region}.your-objectstorage.com`,
      forcePathStyle: false,
      credentials: {
        accessKeyId: fileStorageProvider.accessKeyId,
        secretAccessKey: fileStorageProvider.secretAccessKey,
      },
    };
    const client = new S3Client(clientConfig);
    const adapter = new AwsS3StorageAdapter(
      client,
      {
        bucket: fileStorageProvider.bucket,
        prefix: '',
      },
      {
        publicUrl(path: string): Promise<string> {
          return Promise.resolve(
            `https://${fileStorageProvider.bucket}.${fileStorageProvider.region}.your-objectstorage.com/${path}`,
          );
        },
      },
    );
    return new FileStorage(adapter);
  }
}
