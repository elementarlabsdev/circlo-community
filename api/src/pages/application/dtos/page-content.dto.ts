import { IsNotEmpty } from 'class-validator';

export class PageContentDto {
  @IsNotEmpty()
  title: string;

  blocksContent: any[];
}
