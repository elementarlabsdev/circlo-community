import { Global, Module } from '@nestjs/common';
import { ANNOUNCEMENT_REPOSITORY } from './domain/repositories/announcement-repository.interface';
import { PrismaAnnouncementRepository } from './infrastructure/persistence/prisma-announcement.repository';
import { GetCurrentAnnouncementUseCase } from './application/use-cases/get-current-announcement.use-case';
import { DismissAnnouncementUseCase } from './application/use-cases/dismiss-announcement.use-case';
import { MarkAnnouncementAsReadUseCase } from './application/use-cases/mark-announcement-as-read.use-case';
import { AnnouncementsController } from './infrastructure/controllers/announcements.controller';

@Global()
@Module({
  imports: [],
  controllers: [AnnouncementsController],
  providers: [
    GetCurrentAnnouncementUseCase,
    DismissAnnouncementUseCase,
    MarkAnnouncementAsReadUseCase,
    {
      provide: ANNOUNCEMENT_REPOSITORY,
      useClass: PrismaAnnouncementRepository,
    },
  ],
  exports: [
    GetCurrentAnnouncementUseCase,
    DismissAnnouncementUseCase,
    MarkAnnouncementAsReadUseCase,
  ],
})
export class AnnouncementsModule {}
