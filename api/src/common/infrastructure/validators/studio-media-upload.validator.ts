import { FileValidator, Inject, Injectable } from '@nestjs/common';
import {
  IMAGE_UPLOAD_MAX_SIZE_IN_BYTES,
  IMAGE_VALID_UPLOAD_MIME_TYPES,
  VIDEO_MAX_SIZE_IN_BYTES,
  VIDEO_VALID_UPLOAD_MIME_TYPES,
} from '@/common/domain/interfaces/types';
import {
  SETTING_REPOSITORY,
  SettingsRepositoryInterface,
} from '@/settings/domain/repositores/settings-repository.interface';

@Injectable()
export class StudioMediaUploadValidator extends FileValidator {
  private _imageMaxSize: number = IMAGE_UPLOAD_MAX_SIZE_IN_BYTES;
  private _videoMaxSize: number = VIDEO_MAX_SIZE_IN_BYTES;

  constructor(
    @Inject(SETTING_REPOSITORY)
    private readonly settingsRepository: SettingsRepositoryInterface,
  ) {
    super({});
  }

  async isValid(file?: Express.Multer.File): Promise<boolean> {
    if (!file) {
      return false;
    }

    if (!this.settingsRepository) {
      return file.size <= (IMAGE_VALID_UPLOAD_MIME_TYPES.includes(file.mimetype) ? this._imageMaxSize : this._videoMaxSize);
    }

    await this.loadLimits();

    if (IMAGE_VALID_UPLOAD_MIME_TYPES.includes(file.mimetype)) {
      return file.size <= this._imageMaxSize;
    }

    if (VIDEO_VALID_UPLOAD_MIME_TYPES.includes(file.mimetype)) {
      return file.size <= this._videoMaxSize;
    }

    return false;
  }

  private async loadLimits() {
    const imageSizeMb = await this.settingsRepository.findValueByName(
      'maxUploadImageSize',
    );
    const videoSizeMb = await this.settingsRepository.findValueByName(
      'maxUploadVideoSize',
    );

    if (imageSizeMb) {
      this._imageMaxSize = imageSizeMb * 1024 * 1024;
    }

    if (videoSizeMb) {
      this._videoMaxSize = videoSizeMb * 1024 * 1024;
    }
  }

  buildErrorMessage(file: Express.Multer.File): string {
    if (!file) {
      return 'File is required';
    }

    if (IMAGE_VALID_UPLOAD_MIME_TYPES.includes(file.mimetype)) {
      return `Image size should be less than ${this._imageMaxSize / (1024 * 1024)}MB`;
    }

    if (VIDEO_VALID_UPLOAD_MIME_TYPES.includes(file.mimetype)) {
      return `Video size should be less than ${this._videoMaxSize / (1024 * 1024)}MB`;
    }

    return 'Unsupported file type';
  }
}
