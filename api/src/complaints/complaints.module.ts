import { Global, Module } from '@nestjs/common';
import { ComplaintsService } from './application/services/complaints.service';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ComplaintsController } from './infrastructure/controllers/complaints.controller';
import { AdminComplaintsController } from './infrastructure/controllers/admin-complaints.controller';
import { ComplaintNotificationService } from './application/services/complaint-notification.service';
import { COMPLAINT_REPOSITORY } from '@/complaints/domain/repositories/complaint.repository.interface';
import { PrismaComplaintRepository } from '@/complaints/infrastructure/persistence/prisma-complaint.repository';
import { COMPLAINTS_TARGET_VALIDATOR } from '@/complaints/domain/services/complaints-target-validator.interface';
import { PrismaComplaintsTargetValidator } from '@/complaints/infrastructure/services/prisma-complaints-target-validator.service';
import { AdminComplaintsDataTableService } from '@/complaints/application/services/admin-complaints-data-table.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [ComplaintsController, AdminComplaintsController],
  providers: [
    PrismaService,
    ComplaintsService,
    ComplaintNotificationService,
    AdminComplaintsDataTableService,
    { provide: COMPLAINT_REPOSITORY, useClass: PrismaComplaintRepository },
    {
      provide: COMPLAINTS_TARGET_VALIDATOR,
      useClass: PrismaComplaintsTargetValidator,
    },
  ],
  exports: [
    ComplaintsService,
    COMPLAINT_REPOSITORY,
    COMPLAINTS_TARGET_VALIDATOR,
  ],
})
export class ComplaintsModule {}
