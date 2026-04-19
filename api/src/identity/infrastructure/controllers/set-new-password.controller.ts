import { Body, Controller, Get, Param, Post, Ip } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { UsersService } from '@/identity/application/services/users.service';
import { SetNewPasswordDto } from '@/identity/application/dtos/set-new-password.dto';
import { CaptchaValidationService } from '@/identity/application/services/captcha-validation.service';

 @Controller('identity/set-new-password')
 export class SetNewPasswordController {
   constructor(
     private _prisma: PrismaService,
     private _usersService: UsersService,
     private _captchaValidation: CaptchaValidationService,
   ) {}

  @Get(':hash')
  async index(@Param('hash') hash: string) {
    await this._prisma.passwordReset.findUniqueOrThrow({
      where: {
        hash,
        verified: true,
      },
    });
    return {
    };
  }

  @Post(':hash')
  async check(
    @Param('hash') hash: string,
    @Body() setNewPasswordDto: SetNewPasswordDto,
    @Ip() ip: string,
  ) {
    await this._captchaValidation.validate(setNewPasswordDto, ip);

    let valid = false;
    const passwordReset = await this._prisma.passwordReset.findUniqueOrThrow({
      where: {
        hash,
        verified: true,
      },
      include: {
        user: true,
      },
    });

    if (setNewPasswordDto.password === setNewPasswordDto.confirmPassword) {
      valid = true;
      await this._usersService.setUserPassword(
        passwordReset.user.id,
        setNewPasswordDto.password,
      );
      await this._prisma.passwordReset.delete({
        where: {
          id: passwordReset.id,
        },
      });
    }

    return {
      valid,
    };
  }
}
