import { CaptchaProvider } from '@/platform/domain/entities/captcha-provider.entity';

export const CAPTCHA_PROVIDER_REPOSITORY = 'CAPTCHA_PROVIDER_REPOSITORY';

export interface CaptchaProviderRepositoryInterface {
  findById(id: string): Promise<CaptchaProvider | null>;
  findByType(type: string): Promise<CaptchaProvider | null>;
  findAll(): Promise<CaptchaProvider[]>;
  save(provider: CaptchaProvider): Promise<void>;
  setDefault(type: string): Promise<void>;
}
