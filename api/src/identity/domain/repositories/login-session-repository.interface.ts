import { LoginSession } from '@/identity/domain/entities/login-session.entity';

export const LOGIN_SESSION_REPOSITORY = 'LoginSessionRepository';

export interface LoginSessionRepositoryInterface {
  create(session: LoginSession): Promise<void>;
  findById(id: string): Promise<LoginSession | null>;
  findByUser(userId: string): Promise<LoginSession[]>;
  revokeById(id: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
  revokeAllExcept(userId: string, sessionId: string): Promise<void>;
  touchActivity(id: string, at?: Date): Promise<void>;
  markCurrent(id: string): Promise<void>;
  deleteExpired(before: Date): Promise<number>;
}
