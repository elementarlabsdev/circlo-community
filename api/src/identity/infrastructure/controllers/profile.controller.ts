import { Controller, Get, Req } from '@nestjs/common';
import { Request } from '@/common/domain/interfaces/interfaces';
import { UsersService } from '@/identity/application/services/users.service';

@Controller()
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  profile(@Req() request: Request): object {
    return {
      isLogged: !!request.user,
      profile: this.usersService.getProfile(request.user),
    };
  }
}
