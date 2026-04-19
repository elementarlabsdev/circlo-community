import { User } from '@/identity/domain/entities/user.entity';

export class SendResetPasswordCodeDto {
  user: User;
}
