import { Inject, Injectable } from '@nestjs/common';
import {
  MAIL_PROVIDER_REPOSITORY,
  MailProviderRepositoryInterface,
} from '@/platform/domain/repositories/mail-provider.repository.interface';

@Injectable()
export class GetAllMailProvidersUseCase {
  constructor(
    @Inject(MAIL_PROVIDER_REPOSITORY)
    private readonly mailProviderRepo: MailProviderRepositoryInterface,
  ) {}

  async execute() {
    const providers = await this.mailProviderRepo.findAll();
    return providers.map(p => p.toPrimitives());
  }
}
