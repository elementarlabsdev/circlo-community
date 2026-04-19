import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { LessonsService } from '@/tutorials/application/services/lessons.service';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { LessonContentDto } from '@/tutorials/application/dto/lesson-content.dto';
import { LessonNameDto } from '@/tutorials/application/dto/lesson-name.dto';

@Controller('studio/tutorials/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  async getLesson(@GetUser() user: User, @Param('id') id: string) {
    const lesson = await this.lessonsService.getLesson(id, user.id);
    return { lesson };
  }

  @UseGuards(AuthGuard)
  @Post(':id/content')
  async saveLessonContent(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() dto: LessonContentDto,
  ) {
    const res = await this.lessonsService.saveLessonContent(id, user.id, dto);
    return res;
  }

  @UseGuards(AuthGuard)
  @Post(':id/name')
  async saveLessonName(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() dto: LessonNameDto,
  ) {
    const res = await this.lessonsService.saveLessonName(id, user.id, dto);
    return res;
  }
}
