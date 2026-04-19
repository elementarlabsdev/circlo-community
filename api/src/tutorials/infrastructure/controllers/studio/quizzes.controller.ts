import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { QuizNameDto } from '@/tutorials/application/dto/quiz-name.dto';
import { TutorialsService } from '@/tutorials/application/services/tutorials.service';
import { SaveQuizContentDto } from '@/tutorials/application/dto/save-quiz-content.dto';

@UseGuards(AuthGuard)
@Controller('studio/tutorials/quizzes')
export class QuizzesController {
  constructor(private readonly tutorialsService: TutorialsService) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  async getQuiz(@GetUser() user: User, @Param('id') id: string) {
    const quiz = await this.tutorialsService.getQuiz(id, user.id);
    return { quiz };
  }

  @Post(':id/name')
  async saveQuizName(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() dto: QuizNameDto,
  ) {
    const res = await this.tutorialsService.saveQuizName(id, user.id, dto);
    return res;
  }

  @Post(':id/content')
  async saveQuizContent(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() dto: SaveQuizContentDto,
  ) {
    const res = await this.tutorialsService.saveQuizContent(id, user.id, dto);
    return { quiz: res };
  }
}
