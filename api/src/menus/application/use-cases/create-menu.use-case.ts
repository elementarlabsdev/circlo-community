import { Inject, Injectable } from '@nestjs/common';
import { CreateMenuDto } from '../dtos/create-menu.dto';
import {
  MENU_REPOSITORY,
  MenuRepositoryInterface,
} from '@/menus/domain/repositories/menu-repository.interface';
import { Menu } from '@/menus/domain/entities/menu.entity';

@Injectable()
export class CreateMenuUseCase {
  constructor(
    @Inject(MENU_REPOSITORY)
    private readonly menuRepository: MenuRepositoryInterface,
  ) {}

  async execute(dto: CreateMenuDto): Promise<{ id: string }> {
    const menu = Menu.create({
      name: dto.name,
      type: dto.type,
    });
    await this.menuRepository.save(menu);

    return { id: menu.id };
  }
}
