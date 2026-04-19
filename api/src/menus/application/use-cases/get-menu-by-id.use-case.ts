import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MENU_REPOSITORY,
  MenuRepositoryInterface,
} from '@/menus/domain/repositories/menu-repository.interface';
import { MenuViewModel } from '@/menus/domain/menus.model';

@Injectable()
export class GetMenuByIdUseCase {
  constructor(
    @Inject(MENU_REPOSITORY)
    private readonly menuRepository: MenuRepositoryInterface,
  ) {}

  async execute(id: string): Promise<MenuViewModel> {
    const menu = await this.menuRepository.findById(id);

    if (!menu) {
      throw new NotFoundException('Menu not found.');
    }

    const primitives = menu.toPrimitives();
    return {
      id: primitives.id,
      name: primitives.name,
      type: primitives.type,
      position: primitives.position,
      isPublished: primitives.items.length > 0,
      items: primitives.items.map((item) => ({
        id: item.id,
        name: item.name,
        url: item.url,
        iconUrl: item.iconUrl,
        position: item.position,
        authorisedOnly: item.authorisedOnly,
      })),
    };
  }
}
