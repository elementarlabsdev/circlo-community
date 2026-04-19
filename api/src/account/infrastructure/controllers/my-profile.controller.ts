import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { Request } from '@/common/domain/interfaces/interfaces';
import { FileInterceptor } from '@nestjs/platform-express';
import { PROFILE_AVATAR_UPLOAD_PIPE_BUILDER } from '@/common/infrastructure/validators/profile-avatar-upload.pipe-builder';
import { GetMyProfileUseCase } from '@/account/application/use-cases/get-my-profile.use-case';
import { SaveMyProfileUseCase } from '@/account/application/use-cases/save-my-profile.use-case';
import { ValidateUsernameUseCase } from '@/account/application/use-cases/validate-username.use-case';
import { UploadAvatarUseCase } from '@/account/application/use-cases/upload-avatar.use-case';
import { MyProfileDto } from '@/account/application/dtos/my-profile.dto';
import { UsernameValidateDto } from '@/account/application/dtos/username-validate.dto';

@Controller('studio/account/my-profile')
@UseGuards(AuthGuard)
export class MyProfileController {
  constructor(
    private readonly getMyProfile: GetMyProfileUseCase,
    private readonly saveMyProfile: SaveMyProfileUseCase,
    private readonly validateUsername: ValidateUsernameUseCase,
    private readonly uploadAvatar: UploadAvatarUseCase,
  ) {}

  @Get()
  async edit(@Req() request: Request) {
    return this.getMyProfile.execute(request);
  }

  @Post()
  async save(@Req() request: Request, @Body() myProfileDto: MyProfileDto) {
    await this.saveMyProfile.execute(request.user.id, myProfileDto);
    return {};
  }

  @Post('username/validate')
  async usernameValidate(@Body() usernameValidateDto: UsernameValidateDto) {
    return this.validateUsername.execute(usernameValidateDto);
  }

  @Post('avatar/upload')
  @UseInterceptors(FileInterceptor('image'))
  async avatarUpload(
    @Req() req: any,
    @UploadedFile(PROFILE_AVATAR_UPLOAD_PIPE_BUILDER)
    uploadedFile: Express.Multer.File,
  ) {
    return this.uploadAvatar.execute(req.user, uploadedFile);
  }
}
