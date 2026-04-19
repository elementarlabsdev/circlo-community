import { Global, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AdminPagesController } from '@/pages/infrastructure/controllers/admin.pages.controller';
import { PageController } from '@/pages/infrastructure/controllers/page.controller';
import { PagePublicService } from '@/pages/application/services/page-public.service';
import { PagesPrismaRepository } from '@/pages/infrastructure/persistence/pages.prisma.repository';
import { PAGE_REPOSITORY } from '@/pages/domain/repositories/page-repository.interface';
import { PagesDataTableService } from '@/pages/application/services/pages-data-table.service';
import { FeaturedImageService } from '@/common/application/services/featured-image.service';
import { PagesTableService } from '@/pages/application/services/pages-table.service';
import { PageListService } from '@/pages/application/services/page-list.service';

@Global()
@Module({
  imports: [MulterModule],
  controllers: [AdminPagesController, PageController],
  providers: [
    // public read model service
    PagePublicService,

    // services used by admin pages flows
    FeaturedImageService,
    PagesTableService,
    PageListService,

    // Datatable service for admin pages table
    PagesDataTableService,

    // Repositories
    PagesPrismaRepository,
    { provide: PAGE_REPOSITORY, useClass: PagesPrismaRepository },
  ],
  exports: [],
})
export class PagesModule {}
