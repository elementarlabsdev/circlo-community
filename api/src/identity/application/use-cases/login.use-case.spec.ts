import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from './login.use-case';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { USER_REPOSITORY } from '@/identity/domain/repositories/user-repository.interface';
import { ROLE_REPOSITORY } from '@/identity/domain/repositories/role-repository.interface';
import { LOGIN_SESSION_REPOSITORY } from '@/identity/domain/repositories/login-session-repository.interface';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SendEmailVerificationCodeUseCase } from '@/identity/application/use-cases/send-email-verification-code.use-case';
import { SettingsService } from '@/settings/application/services/settings.service';
import { I18nService } from 'nestjs-i18n';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: any;
  let roleRepository: any;

  beforeEach(async () => {
    userRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    roleRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: USER_REPOSITORY, useValue: userRepository },
        { provide: ROLE_REPOSITORY, useValue: roleRepository },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
        { provide: LOGIN_SESSION_REPOSITORY, useValue: { create: jest.fn() } },
        { provide: PrismaService, useValue: {} },
        { provide: SendEmailVerificationCodeUseCase, useValue: {} },
        { provide: SettingsService, useValue: {} },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockImplementation((key) => key),
          },
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const dto = { email: 'nonexistent@example.com', password: 'password' };

    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
    await expect(useCase.execute(dto)).rejects.toMatchObject({
      response: {
        type: 'invalidCredentials',
      },
    });

    expect(roleRepository.findById).not.toHaveBeenCalled();
  });

  it('should check for user existence before accessing properties', async () => {
    // This is basically the same as above, but explicitly testing the fix
    userRepository.findByEmail.mockResolvedValue(null);
    const dto = { email: 'nonexistent@example.com', password: 'password' };

    try {
      await useCase.execute(dto);
    } catch (e) {
      // ignore
    }

    expect(roleRepository.findById).not.toHaveBeenCalled();
  });
});
