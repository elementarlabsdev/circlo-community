import { FileValidator } from '@nestjs/common';

export interface UploadTypeValidatorOptions {
  fileType: string[];
}

export class UploadFileTypeValidator extends FileValidator {
  private _allowedMimeTypes: string[] = [];

  constructor(protected readonly validationOptions: UploadTypeValidatorOptions) {
    super(validationOptions);
    this._allowedMimeTypes = this.validationOptions.fileType;
  }

  isValid(file?: Express.Multer.File): boolean {
    return this._allowedMimeTypes.includes(file.mimetype);
  }

  buildErrorMessage(): string {
    return `Upload not allowed. Upload only files of type: ${this._allowedMimeTypes.join(', ',)}`;
  }
}
