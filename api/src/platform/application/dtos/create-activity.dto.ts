import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsJSON,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  actor: User;

  @ApiProperty({
    example: 'POST_CREATED',
    description: 'Тип совершенного действия',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  action: string;

  @ApiPropertyOptional({
    example: 'POST',
    description: 'Тип сущности, над которой совершено действие',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  targetType?: string;

  @ApiPropertyOptional({
    example: 'clqj8y2z000018smrdun1x3i9',
    description: 'ID сущности, над которой совершено действие',
  })
  @IsOptional()
  @IsString()
  targetId?: string;

  @ApiPropertyOptional({
    example: { title: 'Новый пост', contentPreview: '...' },
    description: 'Дополнительные детали в формате JSON',
  })
  @IsOptional()
  @IsJSON()
  details?: object;
}
