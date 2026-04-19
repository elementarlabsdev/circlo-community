import { Controller, Get, UseGuards } from '@nestjs/common';
import { TutorialsService } from '@/tutorials/application/services/tutorials.service';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { User } from '@prisma/client';

@UseGuards(AuthGuard)
@Controller()
export class MyTutorialsController {
  constructor(private readonly tutorialsService: TutorialsService) {}

  @Get('studio/my-tutorials')
  async getMyTutorials(@GetUser() user: User) {
    return {
      hasAnyTutorial:
        (await this.tutorialsService.getTutorialsCountByInstructor(user.id)) > 0,
      groupedTutorials:
        await this.tutorialsService.getInstructorTutorialsGroupedByStatuses(
          user.id,
        ),
    };
  }

  @Get('studio/my-tutorials-stats')
  async getMyTutorialCounts(@GetUser() user: User) {
    const counts = await this.tutorialsService.getTutorialsCountByInstructor(
      user.id,
    );
    return { counts };
  }
}
