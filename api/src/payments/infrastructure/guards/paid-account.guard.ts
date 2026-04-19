import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SettingsService } from '@/settings/application/services/settings.service';

@Injectable()
export class PaidAccountGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Skip if user is not logged in (other guards handle auth)
    if (!user) {
      return true;
    }

    // Skip for super admins
    if (user.isSuperAdmin) {
      return true;
    }

    // Skip for paths that must be accessible without payment
    const path = request.url;
    const excludedPaths = [
      '/api/v1/initialize',
      '/api/v1/identity/login',
      '/api/v1/identity/register',
      '/api/v1/identity/page-settings',
      '/api/v1/payments/checkout',
      '/api/v1/payments/stripe-status',
      '/api/v1/payments/webhook',
      '/api/v1/payments/confirm-payment',
    ];

    if (excludedPaths.some((p) => path.startsWith(p))) {
      return true;
    }

    const monetizationPaidAccountEnabledRaw =
      await this.settingsService.findValueByName(
        'monetizationPaidAccountEnabled',
        false,
      );
    const monetizationPaidAccountEnabled =
      monetizationPaidAccountEnabledRaw === 'true' ||
      monetizationPaidAccountEnabledRaw === true;

    if (!monetizationPaidAccountEnabled) {
      return true;
    }

    const purchase = await this.prisma.purchase.findFirst({
      where: {
        userId: user.id,
        status: 'completed',
        publicationId: null,
        tutorialId: null,
      },
    });

    if (purchase) {
      return true;
    }

    throw new HttpException('Payment Required', HttpStatus.PAYMENT_REQUIRED);
  }
}
