import { Module, Global } from '@nestjs/common';
import { AbilitiesGuard } from './guards/abilities.guard';

@Global()
@Module({
  providers: [AbilitiesGuard],
  exports: [AbilitiesGuard],
})
export class CaslModule {}
