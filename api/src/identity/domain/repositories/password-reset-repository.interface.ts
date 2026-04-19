import { PasswordReset } from '@/identity/domain/entities/password-reset.entity';

export const PASSWORD_RESET_REPOSITORY = 'PasswordResetRepository';

export interface PasswordResetRepositoryInterface {
  save(reset: PasswordReset): Promise<void>;
  findByUserId(args: {
    where: { userId: string };
  }): Promise<PasswordReset | null>;
  create(reset: PasswordReset): Promise<PasswordReset>;
  update(reset: PasswordReset): Promise<PasswordReset>;
}
