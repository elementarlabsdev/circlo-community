import { EmailChange } from '../entities/email-change.entity';

export const EMAIL_CHANGE_REPOSITORY = Symbol('EMAIL_CHANGE_REPOSITORY');

export interface EmailChangeRepositoryInterface {
  upsert(change: EmailChange): Promise<void>;
  findByUserId(userId: string): Promise<EmailChange | null>;
  deleteByUserId(userId: string): Promise<void>;
}
