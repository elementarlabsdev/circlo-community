import { User } from '../entities/user.entity';

export const USER_REPOSITORY = 'UserRepository';

export interface UserRepositoryInterface {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  countAll(): Promise<number>;
}
