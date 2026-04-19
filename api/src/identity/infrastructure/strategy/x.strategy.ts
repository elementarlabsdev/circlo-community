import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class XStrategy {
  private readonly logger = new Logger(XStrategy.name);
}
