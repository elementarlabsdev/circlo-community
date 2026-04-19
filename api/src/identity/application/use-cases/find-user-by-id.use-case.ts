import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepositoryInterface } from '@/identity/domain/repositories/user-repository.interface';

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  execute(id: string) {
    return this.userRepository.findById(id);
  }
}
