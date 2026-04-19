import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';
import prismaRandom from 'prisma-extension-random';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      omit: {
        user: {
          password: true,
          openAIApiKey: true,
          email: true,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  random() {
    return this.$extends(prismaRandom());
  }
}
