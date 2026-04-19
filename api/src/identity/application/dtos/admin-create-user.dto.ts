import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminCreateUserDto {
  @ApiProperty({ description: 'Full title of the user' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique username (login)' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'User email' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'Password (required, 16-20 characters)',
  })
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(20, { message: 'Password must be at most 20 characters long' })
  password: string;

  @ApiProperty({ description: 'User role ID' })
  @IsNotEmpty()
  roleId: string;

  @ApiProperty({
    description: 'Whether the user email is verified',
    required: false,
  })
  @IsOptional()
  verified?: boolean;

  @ApiProperty({
    description: 'Send the new user an email about their account',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;
}
