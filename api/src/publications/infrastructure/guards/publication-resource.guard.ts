import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PublicationsService } from '@/publications/application/services/publications.service';
import { Publication } from '@/publications/domain/entities/publication.entity';

/**
 * Загружает публикацию по :hash и помещает в request.resource
 * Используется перед PoliciesGuard для ABAC-проверок
 */
@Injectable()
export class PublicationResourceGuard implements CanActivate {
  constructor(private readonly publicationsService: PublicationsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const hash = request.params?.hash as string;
    if (!hash) return false;

    // Для студии требуется черновик; при необходимости можно обобщить
    const publication = await this.publicationsService.findDraftByHash(hash);
    request.resource = Publication.reconstitute(publication);
    return true;
  }
}
