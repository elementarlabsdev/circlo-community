import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TutorialsService } from '@/tutorials/application/services/tutorials.service';
import { Tutorial } from '@/tutorials/domain/entities/tutorial.entity';

/**
 * Loads tutorial by :id and puts it into request.resource
 * Used before PoliciesGuard for ABAC checks
 */
@Injectable()
export class TutorialResourceGuard implements CanActivate {
  constructor(private readonly tutorialsService: TutorialsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const id = request.params?.id as string;
    if (!id) return false;

    // Use getTutorialById or findOneByIdWithRelations depending on what's needed for ABAC
    // Normally just checking authorId is enough, getTutorialById should suffice
    const tutorial = await this.tutorialsService.getTutorialById(id);
    if (!tutorial) return false;

    request.resource = Tutorial.reconstitute(tutorial as any);
    return true;
  }
}
