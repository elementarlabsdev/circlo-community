import { PaymentProvider } from '@/platform/domain/entities/payment-provider.entity';

export const PAYMENT_PROVIDER_REPOSITORY = 'PaymentProviderRepository';

export interface PaymentProviderRepositoryInterface {
  findById(id: string): Promise<PaymentProvider | null>;
  findByType(type: string): Promise<PaymentProvider | null>;
  findAll(): Promise<PaymentProvider[]>;
  create(provider: any): Promise<PaymentProvider>;
  save(provider: PaymentProvider): Promise<void>;
}
