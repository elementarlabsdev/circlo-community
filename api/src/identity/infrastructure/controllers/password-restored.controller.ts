import { Controller, Get } from '@nestjs/common';

@Controller('identity/password-restored')
export class PasswordRestoredController {
  @Get()
  async index() {
    return {};
  }
}
