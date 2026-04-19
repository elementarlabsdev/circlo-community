import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MenuDto {
  @IsNotEmpty()
  name: string;
  items: MenuItemDto[];
}

export class MenuItemDto {
  id: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  url: string;

  @IsNumber()
  @IsNotEmpty()
  position: number;

  @IsBoolean()
  @IsNotEmpty()
  authorisedOnly: boolean;
}
