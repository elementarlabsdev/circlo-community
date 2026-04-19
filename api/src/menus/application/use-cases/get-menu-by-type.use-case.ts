import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MENU_REPOSITORY,
  MenuRepositoryInterface,
} from '@/menus/domain/repositories/menu-repository.interface';
import { MenuViewModel } from '@/menus/domain/menus.model';
import { SettingsService } from '@/settings/application/services/settings.service';

@Injectable()
export class GetMenuByTypeUseCase {
  constructor(
    @Inject(MENU_REPOSITORY)
    private readonly menuRepository: MenuRepositoryInterface,
    private readonly settingsService: SettingsService,
  ) {}

  async execute(type: string, isAdmin = false): Promise<MenuViewModel> {
    const menu = await this.menuRepository.findByType(type);

    if (!menu) {
      throw new NotFoundException('Menu not found.');
    }

    const primitives = menu.toPrimitives();

    let filteredItems = primitives.items;

    if (!isAdmin) {
      const allowThreads = await this.settingsService.findValueByName('contentAllowThreads', true);
      const allowPublications = await this.settingsService.findValueByName('contentAllowPublications', true);
      const allowTutorials = await this.settingsService.findValueByName('contentAllowTutorials', true);

      filteredItems = primitives.items.filter(item => {
        if (item.url.includes('/threads') && !allowThreads) return false;
        if (item.url.includes('/publications') && !allowPublications) return false;
        if (item.url.includes('/tutorials') && !allowTutorials) return false;
        return true;
      });
    }

    return {
      id: primitives.id,
      name: primitives.name,
      type: primitives.type,
      position: primitives.position,
      isPublished: filteredItems.length > 0,
      items: filteredItems.map((item) => ({
        id: item.id,
        name: item.name,
        iconName: item.iconName,
        iconUrl: item.iconUrl,
        url: item.url,
        position: item.position,
        authorisedOnly: item.authorisedOnly,
      })),
    };
  }
}
