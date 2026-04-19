import { Global, Module } from '@nestjs/common';
import { CreditsService } from '@/credits/application/services/credits.service';
import { CreditsRepository } from '@/credits/infrastructure/persistence/credits-prisma.repository';
import { CreditsController, AdminCreditsController } from '@/credits/infrastructure/controllers/credits.controller';

@Global()
@Module({
  controllers: [CreditsController, AdminCreditsController],
  providers: [CreditsService, CreditsRepository],
  exports: [CreditsService],
})
export class CreditsModule {}
