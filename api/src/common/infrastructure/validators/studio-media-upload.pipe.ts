import {
  ArgumentMetadata,
  HttpStatus,
  Injectable,
  ParseFilePipeBuilder,
  PipeTransform,
} from '@nestjs/common';
import { StudioMediaUploadValidator } from './studio-media-upload.validator';

@Injectable()
export class StudioMediaUploadPipe implements PipeTransform {
  constructor(private readonly validator: StudioMediaUploadValidator) {}

  async transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    const pipe = new ParseFilePipeBuilder()
      .addValidator(this.validator)
      .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY });

    return await pipe.transform(value);
  }
}
