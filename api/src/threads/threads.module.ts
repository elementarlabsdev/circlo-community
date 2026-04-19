import { Global, Module } from '@nestjs/common';
import { ThreadsService } from '@/threads/application/services/threads.service';
import { THREAD_REPOSITORY } from '@/threads/domain/repositories/thread-repository.interface';
import { ThreadsPrismaRepository } from '@/threads/infrastructure/persistence/threads.prisma.repository';
import { THREAD_STATUS_REPOSITORY } from '@/threads/domain/repositories/thread-status-repository.interface';
import { ThreadStatusPrismaRepository } from '@/threads/infrastructure/persistence/thread-status.prisma.repository';
import { ThreadsController } from '@/threads/infrastructure/controllers/threads.controller';
import { NotificationsModule } from '@/notifications/notifications.module';
import { IdentityModule } from '@/identity/identity.module';
import { CommonModule } from '@/common/common.module';
import { AdminThreadsController } from '@/threads/infrastructure/controllers/admin-threads.controller';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { ThreadsDataTableService } from '@/threads/application/services/threads-data-table.service';

@Global()
@Module({
  imports: [NotificationsModule, IdentityModule, CommonModule],
  controllers: [ThreadsController, AdminThreadsController],
  providers: [
    ThreadsService,
    { provide: THREAD_REPOSITORY, useClass: ThreadsPrismaRepository },
    {
      provide: THREAD_STATUS_REPOSITORY,
      useClass: ThreadStatusPrismaRepository,
    },
    ThreadsDataTableService,
    { provide: DataTableService, useClass: ThreadsDataTableService },
  ],
  exports: [ThreadsService],
})
export class ThreadsModule {}
