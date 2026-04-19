import { forwardRef, Inject, Injectable, Optional } from '@nestjs/common';
import { FileStorage, Visibility } from '@flystorage/file-storage';
import { dirname, extname, join } from 'path';
import * as crypto from 'crypto';
import * as fs from 'fs';
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

@Injectable()
export class FileStorageService {
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
  ) {}

  private async ensureStorage(): Promise<void> {
    const fileStorageProvider =
      await this._prisma.fileStorageProvider.findFirstOrThrow({
        where: { isConfigured: true, isDefault: true },
      });

    this.fileStorageProvider = fileStorageProvider;
    this._storage = this.getStorageInstance(fileStorageProvider);
  }

  private getStorageInstance(
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
    const writeOptions = this.fileStorageProvider.useAcl
      ? {
          visibility: Visibility.PUBLIC,
        }
      : null;
    await this._storage.write(newFilePath, uploadedFile.buffer, writeOptions);
    const category = getFileCategoryByMimeType(uploadedFile.mimetype);

    const payload: any =
      (await getMediaMetadata(uploadedFile.buffer, uploadedFile.mimetype)) ||
      {};

    const orientation = payload.orientation;

    if (category === FileCategory.Video && this.videoTranscoder) {
      const transcodeResult = await this.videoTranscoder.transcodeBufferToDash(
        uploadedFile.buffer,
        extension,
      );
      if (transcodeResult) {
        const { tempDir, dashDir, mpdFile } = transcodeResult;
        const dashFiles = fs.readdirSync(dashDir);
        const dashTargetFolder = 'dash-' + crypto.randomUUID();

        payload.dash = {
          manifest: '',
          files: [],
        };

        for (const file of dashFiles) {
          const filePath = join(dashDir, file);
          const fileBuffer = fs.readFileSync(filePath);
          const targetPath = join(dashTargetFolder, file);
          await this._storage.write(targetPath, fileBuffer, writeOptions);

          if (file === mpdFile) {
            const publicUrl = await this._storage.publicUrl(targetPath);
            payload.dash.manifest = publicUrl.replace(/\\/g, '/');
          }
        }
        // Cleanup temp files
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }

    const mediaItem = await this._prisma.mediaItem.create({
      data: {
        name: uploadedFile.originalname || crypto.randomUUID(),
        mimeType: uploadedFile.mimetype,
        category,
        type: category,
        size: uploadedFile.size,
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
