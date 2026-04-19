import { Controller, Get } from '@nestjs/common';

@Controller('email-verified')
export class EmailVerifiedController {
  constructor() {}

  @Get()
  async index() {
    return {};
  }
}
