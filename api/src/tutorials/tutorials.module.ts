import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TutorialResourceGuard } from '@/tutorials/infrastructure/guards/tutorial-resource.guard';
import { TutorialsService } from '@/tutorials/application/services/tutorials.service';
import { LessonsService } from '@/tutorials/application/services/lessons.service';
import { TUTORIAL_REPOSITORY } from '@/tutorials/domain/repositories/tutorials-repository.interface';
import { TutorialsPrismaRepository } from '@/tutorials/infrastructure/persistence/tutorials-prisma.repository';
import { LessonsController } from '@/tutorials/infrastructure/controllers/studio/lessons.controller';
import { SectionsController } from '@/tutorials/infrastructure/controllers/studio/sections.controller';
import { MyTutorialsController } from '@/tutorials/infrastructure/controllers/studio/my.controller';
import { StudioTutorialsController } from '@/tutorials/infrastructure/controllers/studio/studio-tutorials.controller';
import { TutorialsDataTableService } from '@/tutorials/application/services/tutorials-data-table.service';
import { AdminTutorialsDataTableService } from '@/tutorials/application/services/admin-tutorials-data-table.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { AdminTutorialsController } from '@/tutorials/infrastructure/controllers/admin-tutorials.controller';
import { AdminTutorialsListService } from '@/tutorials/application/services/admin-tutorials-list.service';
import { TutorialsController } from '@/tutorials/infrastructure/controllers/tutorials.controller';
import { QuizzesController } from '@/tutorials/infrastructure/controllers/studio/quizzes.controller';
import { PublishTutorialProcessor } from '@/tutorials/application/queue-processors/publish-tutorial.processor';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'tutorial-queue',
    }),
  ],
  controllers: [
    LessonsController,
    SectionsController,
    QuizzesController,
    MyTutorialsController,
    AdminTutorialsController,
    TutorialsController,
    StudioTutorialsController,
  ],
  providers: [
    TutorialResourceGuard,
    TutorialsService,
    LessonsService,
    PublishTutorialProcessor,
    TutorialsDataTableService,
    AdminTutorialsDataTableService,
    AdminTutorialsListService,
    { provide: DataTableService, useClass: TutorialsDataTableService },
    { provide: TUTORIAL_REPOSITORY, useClass: TutorialsPrismaRepository },
  ],
  exports: [TutorialsService],
})
export class TutorialsModule {}
