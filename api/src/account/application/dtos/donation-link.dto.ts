import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateDonationLinkDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  platform?: string;
}

export class UpdateDonationLinkDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  platform?: string;
}
