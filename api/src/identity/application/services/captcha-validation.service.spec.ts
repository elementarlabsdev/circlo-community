import { Test, TestingModule } from '@nestjs/testing';
import { CaptchaValidationService } from './captcha-validation.service';
import { CAPTCHA_PROVIDER_REPOSITORY } from '@/platform/domain/repositories/captcha-provider.repository.interface';
import { CapJsService } from '@/common/application/services/capjs.service';
import { RecaptchaService } from '@/common/application/services/recaptcha.service';
import { I18nService } from 'nestjs-i18n';
import { BadRequestException } from '@nestjs/common';

describe('CaptchaValidationService', () => {
  let service: CaptchaValidationService;
  let captchaProviderRepository: any;
  let capjs: any;
  let recaptcha: any;
  let i18n: any;

  beforeEach(async () => {
    captchaProviderRepository = {
      findAll: jest.fn(),
    };
    capjs = {
      verifyToken: jest.fn(),
    };
    recaptcha = {
      verifyToken: jest.fn(),
    };
    i18n = {
      t: jest.fn().mockImplementation((key) => Promise.resolve(key)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaptchaValidationService,
        { provide: CAPTCHA_PROVIDER_REPOSITORY, useValue: captchaProviderRepository },
        { provide: CapJsService, useValue: capjs },
        { provide: RecaptchaService, useValue: recaptcha },
        { provide: I18nService, useValue: i18n },
      ],
    }).compile();

    service = module.get<CaptchaValidationService>(CaptchaValidationService);
  });

  it('should throw BadRequestException if local captcha is default and configured but token is missing', async () => {
    captchaProviderRepository.findAll.mockResolvedValue([
      { type: 'local', isDefault: true, isConfigured: true },
    ]);

    await expect(service.validate({}, '127.0.0.1')).rejects.toThrow(BadRequestException);
  });

  it('should NOT throw if local captcha is default but NOT configured', async () => {
    captchaProviderRepository.findAll.mockResolvedValue([
      { type: 'local', isDefault: true, isConfigured: false },
    ]);

    await expect(service.validate({}, '127.0.0.1')).resolves.not.toThrow();
  });

  it('should NOT throw if no default captcha is set', async () => {
    captchaProviderRepository.findAll.mockResolvedValue([
      { type: 'local', isDefault: false, isConfigured: true },
    ]);

    await expect(service.validate({}, '127.0.0.1')).resolves.not.toThrow();
  });
});
