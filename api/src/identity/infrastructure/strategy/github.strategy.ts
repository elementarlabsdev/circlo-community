import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GithubStrategy {
  private readonly logger = new Logger(GithubStrategy.name);
}
