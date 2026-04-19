import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FacebookStrategy {
  private readonly logger = new Logger(FacebookStrategy.name);
}
