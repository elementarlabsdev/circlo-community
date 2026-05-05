import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { TutorialsService } from '@/tutorials/application/services/tutorials.service';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { ChangeSectionNameDto } from '@/tutorials/application/dto/change-section-name.dto';

@UseGuards(AuthGuard)
@Controller('studio/tutorials')
export class SectionsController {
  constructor(private readonly tutorialsService: TutorialsService) {}

  // Add section to tutorial
  @Post(':tutorialId/sections')
  async addSection(
    @Param('tutorialId') tutorialId: string,
    @GetUser() user: User,
  ) {
    const section = await this.tutorialsService.addSection(tutorialId, user);
    return { section };
  }

  // Add lesson to section
  @Post(':sectionId/lessons')
  async addLesson(
    @Param('sectionId') sectionId: string,
    @GetUser() user: User,
  ) {
    const item = await this.tutorialsService.addLesson(sectionId, user);
    // Explicitly return readingTime so the front end can immediately display the reading duration
    const readingTime = (item as any)?.lesson?.readingTime;
    return { item, readingTime };
  }

  // Add quiz to section
  @Post(':sectionId/quizzes')
  async addQuiz(@Param('sectionId') sectionId: string, @GetUser() user: User) {
    const item = await this.tutorialsService.addQuiz(sectionId, user);
    return { item };
  }

  // Change section title
  @Post('sections/:sectionId/name')
  async changeSectionName(
    @Param('sectionId') sectionId: string,
    @GetUser() user: User,
    @Body() dto: ChangeSectionNameDto,
  ) {
    await this.tutorialsService.changeSectionName(sectionId, user, dto);
    return {};
  }

  // Reorder sections inside a tutorial
  @Post(':tutorialId/sections/reorder')
  async reorderSections(
    @Param('tutorialId') tutorialId: string,
    @GetUser() user: User,
    @Body()
    body: {
      items: { id: string; position: number }[];
    },
  ) {
    const items = Array.isArray(body?.items) ? body.items : [];
    await this.tutorialsService.reorderSections(tutorialId, user, items);
    return { updated: true };
  }

  // Reorder items inside a section
  @Post(':sectionId/items/reorder')
  async reorderItems(
    @Param('sectionId') sectionId: string,
    @GetUser() user: User,
    @Body()
    body: {
      items: { id: string; position: number }[];
    },
  ) {
    const items = Array.isArray(body?.items) ? body.items : [];
    await this.tutorialsService.reorderSectionItems(sectionId, user, items);
    return { updated: true };
  }
}
