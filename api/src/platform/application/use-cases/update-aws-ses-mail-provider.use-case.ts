import { Inject, Injectable } from '@nestjs/common';
import {
  MAIL_PROVIDER_REPOSITORY,
  MailProviderRepositoryInterface,
} from '@/platform/domain/repositories/mail-provider.repository.interface';
import { AwsSesMailProviderDto } from '@/platform/application/dtos/aws-ses-mail-provider.dto';

@Injectable()
export class UpdateAwsSesMailProviderUseCase {
  constructor(
    @Inject(MAIL_PROVIDER_REPOSITORY)
    private readonly mailProviderRepo: MailProviderRepositoryInterface,
  ) {}

  async execute(dto: AwsSesMailProviderDto): Promise<any> {
    const providers = await this.mailProviderRepo.findAll();
    const hasDefault = providers.some((p) => p.isDefault && p.isEnabled && p.type !== 'none');

    let provider = await this.mailProviderRepo.findByType('aws-ses');

    const config = {
      accessKeyId: dto.accessKeyId,
      secretAccessKey: dto.secretAccessKey,
      region: dto.region,
    };

    if (!provider) {
      // Create provider if it does not exist
      provider = await this.mailProviderRepo.create({
        name: 'Amazon SES',
        type: 'aws-ses',
        isEnabled: dto.isEnabled,
        isConfigured: true,
        isDefault: !hasDefault && dto.isEnabled,
        config: config,
      });
      return provider.toPrimitives(); // already persisted
    }

    provider.isEnabled = dto.isEnabled;
    provider.isConfigured = true;
    provider.config = config;

    if (!hasDefault && provider.isEnabled) {
      provider.isDefault = true;
      // also if we are setting this as default, we should make sure 'none' is no longer default
      const noneProvider = providers.find((p) => p.type === 'none');
      if (noneProvider && noneProvider.isDefault) {
        noneProvider.isDefault = false;
        await this.mailProviderRepo.save(noneProvider);
      }
    }

    await this.mailProviderRepo.save(provider);
    return provider.toPrimitives();
  }
}
