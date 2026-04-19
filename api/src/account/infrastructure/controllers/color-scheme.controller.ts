import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { Request } from '@/common/domain/interfaces/interfaces';
import { SaveColorSchemeUseCase } from '@/account/application/use-cases/save-color-scheme.use-case';
import { ColorSchemeDto } from '@/account/application/dtos/color-scheme.dto';

@Controller('studio/account/color-scheme')
@UseGuards(AuthGuard)
export class ColorSchemeController {
  constructor(private readonly saveColorScheme: SaveColorSchemeUseCase) {}

  @Post()
  async save(@Req() request: Request, @Body() colorSchemeDto: ColorSchemeDto) {
    await this.saveColorScheme.execute(
      request.user.id,
      colorSchemeDto.colorScheme,
    );
    return {};
  }
}
