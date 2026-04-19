import { Controller, Get, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from '@/common/domain/interfaces/interfaces';
import { SocialMediaLinkService } from '@/platform/application/services/social-media-link.service';
import { MetaTagService } from '@/platform/application/services/meta-tag.service';
import { PlatformService } from '@/platform/application/services/platform.service';
import { SettingsService } from '@/settings/application/services/settings.service';
import { UsersService } from '@/identity/application/services/users.service';
import { NotificationsManagerService } from '@/notifications/application/services/notifications.manager.service';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { GetCurrentAnnouncementUseCase } from '@/announcements/application/use-cases/get-current-announcement.use-case';
import { GetUserProfileUseCase } from '@/identity/application/use-cases/get-user-profile.use-case';
import { AbilityFactory } from '@/identity/application/services/ability.factory';

@Controller()
export class InitializeController {
  constructor(
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
    private readonly usersService: UsersService,
    private readonly socialMediaLinksService: SocialMediaLinkService,
    private readonly metaTagService: MetaTagService,
    private readonly platformService: PlatformService,
    private readonly notificationService: NotificationsManagerService,
    private readonly getCurrentAnnouncementUseCase: GetCurrentAnnouncementUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  @Get('initialize')
  async initialize(@GetUser() user: User, @Req() request: Request) {
    const countUsers = await this.usersService.count();
    const settings = await this.settingsService.findAllFlatten();
    const captchaProviders =
      await this.platformService.getAllCaptchaProviders();
    const defaultCaptcha = captchaProviders.find(
      (p) => p.isDefault && p.isConfigured,
    );

    // Enforce recaptcha configured flag on the server side based on stored keys
    const siteKey =
      defaultCaptcha?.type === 'recaptcha' ? defaultCaptcha.siteKey : undefined;
    const secretKey =
      defaultCaptcha?.type === 'recaptcha'
        ? defaultCaptcha.secretKey
        : undefined;
    settings.recaptchaSiteKey = siteKey;
    settings.isRecaptchaConfigured = !!siteKey && !!secretKey;

    // CAP JS
    const capSiteKey =
      defaultCaptcha?.type === 'local' ? defaultCaptcha.siteKey : undefined;
    const capSecretKey =
      defaultCaptcha?.type === 'local' ? defaultCaptcha.secretKey : undefined;
    settings.capJsSiteKey = capSiteKey;
    settings.isCapConfigured = !!capSiteKey && !!capSecretKey;
    settings.stripeConfigured = await this.settingsService.findValueByName(
      'stripeConfigured',
      false,
    );

    if (!settings.registrationEnabled) {
      settings.registrationEnabled = countUsers === 0;
    }

    const profile = await this.getUserProfileUseCase.execute(user);

    const ip = request.ip || request.socket.remoteAddress;

    let rules = [];

    if (request.user) {
      const userDomain = await this.usersService.findOneById(request.user.id);
      if (userDomain) {
        rules = (await this.abilityFactory.createForUser(userDomain)).rules;
      }
    }

    const monetizationCreditsEnabled =
      await this.settingsService.findValueByName(
        'monetizationCreditsEnabled',
        false,
      );

    const activeAnalyticsProvider =
      await this.platformService.getActiveAnalyticsProvider();

    const activeAdsProvider = await this.platformService.getActiveAdsProvider();

    return {
      ...settings,
      monetizationCreditsEnabled,
      analyticsProvider: activeAnalyticsProvider,
      adsProvider: activeAdsProvider,
      metaTags: await this.metaTagService.findAllGlobal(),
      socialMediaLinks: await this.socialMediaLinksService.findAllActive(),
      isLogged: !!request.user,
      profile,
      rules,
      unreadNotificationsCount: request.user
        ? await this.notificationService.getUnreadCount(request.user.id)
        : 0,
      imageProxyUrl: this.configService.get('IMAGE_PROXY_URL'),
      hostUrl: this.configService.get('HOST_URL'),
      announcement: await this.getCurrentAnnouncementUseCase.execute(
        user?.id,
        ip,
      ),
    };
  }
}
