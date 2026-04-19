import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SyncCookiesDto } from '@/identity/application/dtos/sync-cookies.dto';
import { USER_REPOSITORY, UserRepositoryInterface } from '@/identity/domain/repositories/user-repository.interface';

@Injectable()
export class SyncCookiesUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(userId: string, dto: SyncCookiesDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.updateCookieConsent(dto.cookieConsent, dto.cookiePreferences);
    await this.userRepository.save(user);
  }
}
