import { EmailVerification } from '@/identity/domain/entities/email-verification.entity';

export const EMAIL_VERIFICATION_REPOSITORY = 'EmailVerificationRepository';

export interface EmailVerificationRepositoryInterface {
  save(emailVerification: EmailVerification): Promise<void>;
}
