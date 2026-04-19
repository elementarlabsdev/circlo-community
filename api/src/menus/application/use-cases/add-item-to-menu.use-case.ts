import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AddMenuItemDto } from '../dtos/add-menu-item.dto';
import {
  MENU_REPOSITORY,
  MenuRepositoryInterface,
} from '@/menus/domain/repositories/menu-repository.interface';

@Injectable()
export class AddItemToMenuUseCase {
  constructor(
    @Inject(MENU_REPOSITORY)
    private readonly menuRepository: MenuRepositoryInterface,
  ) {}

  async execute(menuId: string, dto: AddMenuItemDto): Promise<void> {
    const menu = await this.menuRepository.findById(menuId);
    if (!menu) {
      throw new NotFoundException('Меню не найдено.');
    }

    menu.addItem({
      name: dto.name,
      url: dto.url,
      position: dto.position,
      authorisedOnly: dto.authorisedOnly,
      iconId: dto.iconId,
    });

    await this.menuRepository.save(menu);
  }
}
