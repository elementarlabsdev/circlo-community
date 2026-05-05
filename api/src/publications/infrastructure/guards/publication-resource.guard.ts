import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PublicationsService } from '@/publications/application/services/publications.service';
import { Publication } from '@/publications/domain/entities/publication.entity';

/**
 * Loads a publication by :hash and places it in request.resource
 * Used before PoliciesGuard for ABAC checks
 */
@Injectable()
export class PublicationResourceGuard implements CanActivate {
  constructor(private readonly publicationsService: PublicationsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const hash = request.params?.hash as string;
    if (!hash) return false;

    // Studio requires a draft; this can be generalized if needed
    const publication = await this.publicationsService.findDraftByHash(hash);
    request.resource = Publication.reconstitute(publication);
    return true;
  }
}
