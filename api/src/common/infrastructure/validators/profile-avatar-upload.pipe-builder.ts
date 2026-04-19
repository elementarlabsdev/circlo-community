import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { UploadFileTypeValidator } from './upload-file-type.validator';
import { StudioMediaUploadValidator } from './studio-media-upload.validator';
import {
  FILE_SIZE_IN_BYTES,
  IMAGE_MAX_SIZE_IN_BYTES,
  IMAGE_VALID_UPLOAD_MIME_TYPES,
  PROFILE_AVATAR_MAX_SIZE_IN_BYTES,
} from '@/common/domain/interfaces/types';

export const PROFILE_AVATAR_UPLOAD_PIPE_BUILDER = new ParseFilePipeBuilder()
  .addValidator(
    new UploadFileTypeValidator({
      fileType: IMAGE_VALID_UPLOAD_MIME_TYPES,
    }),
  )
  .addMaxSizeValidator({ maxSize: PROFILE_AVATAR_MAX_SIZE_IN_BYTES })
  .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY });

export const CHANNEL_LOGO_UPLOAD_PIPE_BUILDER = new ParseFilePipeBuilder()
  .addValidator(
    new UploadFileTypeValidator({
      fileType: IMAGE_VALID_UPLOAD_MIME_TYPES,
    }),
  )
  .addMaxSizeValidator({ maxSize: PROFILE_AVATAR_MAX_SIZE_IN_BYTES })
  .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY });

export const IMAGE_UPLOAD_PIPE_BUILDER = new ParseFilePipeBuilder()
  .addValidator(
    new UploadFileTypeValidator({
      fileType: IMAGE_VALID_UPLOAD_MIME_TYPES,
    }),
  )
  .addMaxSizeValidator({ maxSize: IMAGE_MAX_SIZE_IN_BYTES })
  .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY });

export const UPLOAD_FILE_PIPE_BUILDER = new ParseFilePipeBuilder()
  .addValidator(new StudioMediaUploadValidator({} as any))
  .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY });
