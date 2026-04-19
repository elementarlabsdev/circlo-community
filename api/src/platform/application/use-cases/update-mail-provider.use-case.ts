import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MAIL_PROVIDER_REPOSITORY,
  MailProviderRepositoryInterface,
} from '@/platform/domain/repositories/mail-provider.repository.interface';
import { UpdateMailProviderDto } from '@/platform/application/dtos/update-mail-provider.dto';

@Injectable()
export class UpdateMailProviderUseCase {
  constructor(
    @Inject(MAIL_PROVIDER_REPOSITORY)
    private readonly mailProviderRepo: MailProviderRepositoryInterface,
  ) {}

  async execute(id: string, dto: UpdateMailProviderDto): Promise<void> {
    const providers = await this.mailProviderRepo.findAll();
    const hasDefault = providers.some((p) => p.isDefault && p.isEnabled && p.type !== 'none');

    const provider = await this.mailProviderRepo.findById(id);
    if (!provider) {
      throw new NotFoundException('Mail provider not found.');
    }

    provider.updateDetails(dto);

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
  }
}
