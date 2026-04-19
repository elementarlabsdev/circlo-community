import { Menu } from '@/menus/domain/entities/menu.entity';

export const MENU_REPOSITORY = 'MenuRepository';

export interface MenuRepositoryInterface {
  findById(id: string): Promise<Menu | null>;
  findByType(type: string): Promise<Menu | null>;
  save(menu: Menu): Promise<void>;
}
