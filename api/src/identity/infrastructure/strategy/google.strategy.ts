import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GoogleStrategy {
  private readonly logger = new Logger(GoogleStrategy.name);
}
