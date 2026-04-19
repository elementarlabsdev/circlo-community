import { User } from '@/identity/domain/entities/user.entity';

export class SendEmailVerificationCodeDto {
  user: User;
}
