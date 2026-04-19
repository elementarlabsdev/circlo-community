import { IsNotEmpty } from 'class-validator';

export class PublicationContentDto {
  @IsNotEmpty()
  title: string;

  blocksContent: any[];
}
