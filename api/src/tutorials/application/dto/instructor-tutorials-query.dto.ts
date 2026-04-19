import { IsEnum, IsOptional } from 'class-validator';
import { TutorialStatusType } from '@/tutorials/domain/tutorial.model';
import { PaginationQueryDto } from '@/common/application/dtos/pagination-query.dto';

export class InstructorTutorialsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(TutorialStatusType, {
    message: `Status must be one of the following: ${Object.values(TutorialStatusType).join(', ')}`,
  })
  status?: TutorialStatusType;
}
