import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { ResendMailProviderDto } from '@/platform/application/dtos/resend-mail-provider.dto';
import { PlatformService } from '@/platform/application/services/platform.service';
import { UpdateResendMailProviderUseCase } from '@/platform/application/use-cases/update-resend-mail-provider.use-case';
import { UpdateAwsSesMailProviderUseCase } from '@/platform/application/use-cases/update-aws-ses-mail-provider.use-case';
import { AwsSesMailProviderDto } from '@/platform/application/dtos/aws-ses-mail-provider.dto';
import { UpdateSendgridMailProviderUseCase } from '@/platform/application/use-cases/update-sendgrid-mail-provider.use-case';
import { SendgridMailProviderDto } from '@/platform/application/dtos/sendgrid-mail-provider.dto';

@Controller('admin/settings/mail-providers')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminMailProviderController {
  constructor(
    private readonly platformService: PlatformService,
    private readonly updateResendMailProvider: UpdateResendMailProviderUseCase,
    private readonly updateAwsSesProvider: UpdateAwsSesMailProviderUseCase,
    private readonly updateSendgridProvider: UpdateSendgridMailProviderUseCase,
  ) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const mailProviders = await this.platformService.getAllMailProviders();
    return {
      mailProviders,
    };
  }

  @Post('resend')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async resendProviderSave(
    @Body() resendMailProviderDto: ResendMailProviderDto,
  ) {
    const provider = await this.updateResendMailProvider.execute(
      resendMailProviderDto,
    );
    return { provider };
  }

  @Post('aws-ses')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async awsSesSave(@Body() awsSesMailProviderDto: AwsSesMailProviderDto) {
    const provider = await this.updateAwsSesProvider.execute(
      awsSesMailProviderDto,
    );
    return { provider };
  }

  @Post('sendgrid')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async sendgridSave(@Body() sendgridMailProviderDto: SendgridMailProviderDto) {
    const provider = await this.updateSendgridProvider.execute(
      sendgridMailProviderDto,
    );
    return { provider };
  }

  @Post('provider/set-default')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async setDefaultProvider(@Body() dto: { type: string }) {
    await this.platformService.setDefaultMailProvider(dto.type);
    return {};
  }
}
