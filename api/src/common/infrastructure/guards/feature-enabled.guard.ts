import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SettingsService } from '@/settings/application/services/settings.service';
import { FEATURE_ENABLED_KEY } from '@/common/infrastructure/decorators/feature-enabled.decorator';

@Injectable()
export class FeatureEnabledGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private settingsService: SettingsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const featureName = this.reflector.getAllAndOverride<string>(FEATURE_ENABLED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!featureName) {
      return true;
    }

    const isEnabled = await this.settingsService.findValueByName(featureName, true);

    if (!isEnabled) {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (user?.role?.type === 'admin') {
        return true;
      }

      throw new ForbiddenException(`Feature ${featureName} is disabled`);
    }

    return true;
  }
}
