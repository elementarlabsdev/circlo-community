import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

function getOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

@Injectable()
@ValidatorConstraint({ name: 'IsSameOriginAsHost', async: false })
export class SameOriginAsHostConstraint implements ValidatorConstraintInterface {
  constructor(private readonly configService: ConfigService) {}

  validate(value: any, _args: ValidationArguments): boolean {
    if (value === null || value === undefined || value === '') return true; // optional field
    if (typeof value !== 'string') return false;
    const hostUrl = this.configService.get<string>('HOST_URL');
    if (!hostUrl) return true; // if not configured, do not block
    const reportedOrigin = getOrigin(value);
    const hostOrigin = getOrigin(hostUrl);
    if (!reportedOrigin || !hostOrigin) return false;
    return reportedOrigin === hostOrigin;
  }
}

export function IsSameOriginAsHost(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsSameOriginAsHost',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: SameOriginAsHostConstraint,
    });
  };
}
