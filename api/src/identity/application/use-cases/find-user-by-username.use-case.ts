import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepositoryInterface } from '@/identity/domain/repositories/user-repository.interface';

@Injectable()
export class FindUserByUsernameUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  execute(username: string) {
    return this.userRepository.findByUsername(username);
  }
}
