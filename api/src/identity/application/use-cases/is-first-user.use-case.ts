import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@/identity/domain/repositories/user-repository.interface';

@Injectable()
export class IsFirstUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(): Promise<boolean> {
    return (await this.userRepository.countAll()) === 1;
  }
}
