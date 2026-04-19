import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepositoryInterface } from '@/identity/domain/repositories/user-repository.interface';

@Injectable()
export class FindUserByEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  execute(email: string) {
    return this.userRepository.findByEmail(email);
  }
}
