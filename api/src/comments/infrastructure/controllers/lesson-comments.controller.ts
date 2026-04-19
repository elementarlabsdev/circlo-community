import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from '@/common/domain/interfaces/interfaces';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { CommentDto } from '@/comments/application/dto/comment.dto';
import { LessonCommentsService } from '@/comments/application/services/lesson-comments.service';
import { SettingsService } from '@/settings/application/services/settings.service';

@Controller('lesson')
export class LessonCommentsController {
  constructor(
    private readonly lessonComments: LessonCommentsService,
    private readonly settings: SettingsService,
  ) {}

  @Get(':lessonId/comments')
  async index(@Req() request: Request, @Param('lessonId') lessonId: string) {
    return {
      comments: await this.lessonComments.findAllByLessonId(
        lessonId,
        request.user,
      ),
      threadCommentsDepth: await this.settings.findValueByName(
        'threadCommentsDepth',
      ),
    };
  }

  @Post(':lessonId/comments')
  @UseGuards(AuthGuard)
  async add(
    @Req() request: Request,
    @Param('lessonId') lessonId: string,
    @Body() commentDto: CommentDto,
  ) {
    return {
      comment: await this.lessonComments.add(
        lessonId,
        commentDto,
        request.user,
      ),
    };
  }

  @Post('comment/:commentId/reply')
  @UseGuards(AuthGuard)
  async reply(
    @Req() request: Request,
    @Param('commentId') commentId: string,
    @Body() commentDto: CommentDto,
  ) {
    return {
      comment: await this.lessonComments.reply(
        commentId,
        commentDto,
        (request as any).user,
      ),
    };
  }

  @Delete(':lessonId/comments/:commentId')
  @UseGuards(AuthGuard)
  async delete(@Param('commentId') commentId: string) {
    await this.lessonComments.delete(commentId);
    return { ok: true };
  }
}
