import { MailProvider } from '@/platform/domain/entities/mail-provider.entity';

export const MAIL_PROVIDER_REPOSITORY = 'MailProviderRepository';

export interface MailProviderRepositoryInterface {
  findById(id: string): Promise<MailProvider | null>;
  findByType(type: string): Promise<MailProvider | null>;
  findAll(): Promise<MailProvider[]>;
  create(provider: any): Promise<MailProvider>;
  save(provider: MailProvider): Promise<void>;
}
