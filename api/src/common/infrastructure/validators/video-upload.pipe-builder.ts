import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { UploadFileTypeValidator } from './upload-file-type.validator';
import {
  VIDEO_MAX_SIZE_IN_BYTES,
  VIDEO_VALID_UPLOAD_MIME_TYPES,
} from '@/common/domain/interfaces/types';

export const VIDEO_UPLOAD_PIPE_BUILDER = new ParseFilePipeBuilder()
  .addValidator(
    new UploadFileTypeValidator({
      fileType: VIDEO_VALID_UPLOAD_MIME_TYPES,
    }),
  )
  .addMaxSizeValidator({ maxSize: VIDEO_MAX_SIZE_IN_BYTES })
  .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY });
