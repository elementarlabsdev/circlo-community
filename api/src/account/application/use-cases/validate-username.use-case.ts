import { Injectable } from '@nestjs/common';
import { UsersService } from '@/identity/application/services/users.service';
import { UsernameValidateDto } from '@/account/application/dtos/username-validate.dto';

@Injectable()
export class ValidateUsernameUseCase {
  constructor(private readonly usersService: UsersService) {}

  async execute(dto: UsernameValidateDto): Promise<{ invalid: boolean }> {
    const invalid = await this.usersService.uniqueUsernameValidate(
      dto.username,
      dto.userId,
    );
    return { invalid };
  }
}
