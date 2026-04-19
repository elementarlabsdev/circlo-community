import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { UploadFileTypeValidator } from './upload-file-type.validator';
import {
  FEATURE_IMAGE_MAX_SIZE_IN_BYTES,
  FEATURE_IMAGE_VALID_UPLOAD_MIME_TYPES,
} from '@/common/domain/interfaces/types';

export const FEATURED_IMAGE_UPLOAD_PIPE_BUILDER = new ParseFilePipeBuilder()
  .addValidator(
    new UploadFileTypeValidator({
      fileType: FEATURE_IMAGE_VALID_UPLOAD_MIME_TYPES,
    }),
  )
  .addMaxSizeValidator({ maxSize: FEATURE_IMAGE_MAX_SIZE_IN_BYTES })
  .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY });
