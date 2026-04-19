import { IsNotEmpty, IsString } from 'class-validator';
import { AddMenuItemDto } from '@/menus/application/dtos/add-menu-item.dto';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  items: AddMenuItemDto[];
}
