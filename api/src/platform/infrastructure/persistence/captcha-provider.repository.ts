import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { CaptchaProvider } from '@/platform/domain/entities/captcha-provider.entity';
import { CaptchaProviderRepositoryInterface } from '@/platform/domain/repositories/captcha-provider.repository.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CaptchaProviderRepository
  implements CaptchaProviderRepositoryInterface
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private get _config() {
    return {
      captchaHostUrl: this.configService.get<string>('CAPTCHA_HOST_URL'),
      domain: this.configService.get<string>('DOMAIN'),
    };
  }

  async findById(id: string): Promise<CaptchaProvider | null> {
    const rec = await this.prisma.captchaProvider.findUnique({ where: { id } });
    return rec ? CaptchaProvider.reconstitute(rec as any, this._config) : null;
  }

  async findByType(type: string): Promise<CaptchaProvider | null> {
    const rec = await this.prisma.captchaProvider.findUnique({
      where: { type },
    });
    return rec ? CaptchaProvider.reconstitute(rec as any, this._config) : null;
  }

  async findAll(): Promise<CaptchaProvider[]> {
    const rows = await this.prisma.captchaProvider.findMany({
      orderBy: { position: 'asc' },
    });
    return rows.map((r) =>
      CaptchaProvider.reconstitute(r as any, this._config),
    );
  }

  async save(provider: CaptchaProvider): Promise<void> {
    const data = provider.toPrimitives();
    await this.prisma.captchaProvider.update({
      where: { id: data.id },
      data: {
        position: data.position,
        description: data.description,
        siteKey: data.siteKey,
        secretKey: data.secretKey,
        isConfigured: data.isConfigured,
        isDefault: data.isDefault,
      } as any,
    });
  }

  async setDefault(type: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.captchaProvider.updateMany({
        data: { isDefault: false },
      }),
      this.prisma.captchaProvider.update({
        where: { type },
        data: { isDefault: true },
      }),
    ]);
  }
}
