import { IsBoolean, IsNumber } from 'class-validator';

export class ContentSettingsDto {
  @IsBoolean()
  contentAllowThreads: boolean;

  @IsBoolean()
  contentAllowPublications: boolean;

  @IsBoolean()
  contentAllowTutorials: boolean;

  @IsBoolean()
  contentAllowCourses: boolean;

  @IsNumber()
  maxDraftPublicationsPerUser: number;

  @IsNumber()
  maxDraftTutorialsPerUser: number;

  @IsNumber()
  newDraftVersionCreationInterval: number;
}
