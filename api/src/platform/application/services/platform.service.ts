import { Injectable } from '@nestjs/common';
import { FileStorageService } from '@/platform/application/services/file-storage.service';
import { SettingsService } from '@/settings/application/services/settings.service';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { GetAllMailProvidersUseCase } from '@/platform/application/use-cases/get-all-mail-providers.use-case';
import { UpdateMailProviderUseCase } from '@/platform/application/use-cases/update-mail-provider.use-case';
import { UpdateMailProviderDto } from '@/platform/application/dtos/update-mail-provider.dto';
import { GetAllFileStorageProvidersUseCase } from '@/platform/application/use-cases/get-all-file-storage-providers.use-case';
import { UpdateFileStorageProviderUseCase } from '@/platform/application/use-cases/update-file-storage-provider.use-case';
import { GetAllAnalyticsProvidersUseCase } from '@/platform/application/use-cases/get-all-analytics-providers.use-case';
import { UpdateAnalyticsProviderUseCase } from '@/platform/application/use-cases/update-analytics-provider.use-case';
import { GetAllAdsProvidersUseCase } from '@/platform/application/use-cases/get-all-ads-providers.use-case';
import { UpdateAdsProviderUseCase } from '@/platform/application/use-cases/update-ads-provider.use-case';
import { GetActiveAdsProviderUseCase } from '@/platform/application/use-cases/get-active-ads-provider.use-case';
import { GetActiveAnalyticsProviderUseCase } from '@/platform/application/use-cases/get-active-analytics-provider.use-case';
import { GetAllCaptchaProvidersUseCase } from '@/platform/application/use-cases/get-all-captcha-providers.use-case';
import { UpdateCaptchaProviderUseCase } from '@/platform/application/use-cases/update-captcha-provider.use-case';
import { SetDefaultCaptchaProviderUseCase } from '@/platform/application/use-cases/set-default-captcha-provider.use-case';
import { SetDefaultMailProviderUseCase } from '@/platform/application/use-cases/set-default-mail-provider.use-case';
import { GetAllOAuthProvidersUseCase } from '@/platform/application/use-cases/get-all-oauth-providers.use-case';
import { UpdateOAuthProviderUseCase } from '@/platform/application/use-cases/update-oauth-provider.use-case';
import { ReorderOAuthProvidersUseCase } from '@/platform/application/use-cases/reorder-oauth-providers.use-case';
import { IdentityDto } from '@/platform/application/dtos/identity.dto';
import { SecurityDto } from '@/platform/application/dtos/security.dto';
import { CookieConsentDto } from '@/platform/application/dtos/cookie-consent.dto';
import { ContentSettingsDto } from '@/platform/application/dtos/content-settings.dto';

@Injectable()
export class PlatformService {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly fileStorageService: FileStorageService,
    private readonly getAllMailProvidersUseCase: GetAllMailProvidersUseCase,
    private readonly updateMailProviderUseCase: UpdateMailProviderUseCase,
    private readonly getAllFsProvidersUseCase: GetAllFileStorageProvidersUseCase,
    private readonly updateFsProviderUseCase: UpdateFileStorageProviderUseCase,
    private readonly getAllAnalyticsProvidersUc: GetAllAnalyticsProvidersUseCase,
    private readonly updateAnalyticsProviderUc: UpdateAnalyticsProviderUseCase,
    private readonly getAllAdsProvidersUc: GetAllAdsProvidersUseCase,
    private readonly getActiveAdsProviderUc: GetActiveAdsProviderUseCase,
    private readonly updateAdsProviderUc: UpdateAdsProviderUseCase,
    private readonly getActiveAnalyticsProviderUc: GetActiveAnalyticsProviderUseCase,
    private readonly getAllCaptchaProvidersUc: GetAllCaptchaProvidersUseCase,
    private readonly updateCaptchaProviderUc: UpdateCaptchaProviderUseCase,
    private readonly setDefaultCaptchaUc: SetDefaultCaptchaProviderUseCase,
    private readonly setDefaultMailUc: SetDefaultMailProviderUseCase,
    private readonly getAllOAuthProvidersUc: GetAllOAuthProvidersUseCase,
    private readonly updateOAuthProviderUc: UpdateOAuthProviderUseCase,
    private readonly reorderOAuthProvidersUc: ReorderOAuthProvidersUseCase,
    private readonly prisma: PrismaService,
  ) {}

  getAllMailProviders() {
    return this.getAllMailProvidersUseCase.execute();
  }

  updateMailProvider(id: string, dto: UpdateMailProviderDto) {
    return this.updateMailProviderUseCase.execute(id, dto);
  }

  getAllFileStorageProviders() {
    return this.getAllFsProvidersUseCase.execute();
  }

  updateFileStorageProvider(
    type: string,
    data: {
      isEnabled?: boolean;
      endpoint?: string | null;
      publicUrl?: string | null;
      accessKeyId?: string | null;
      secretAccessKey?: string | null;
      region?: string | null;
      bucket?: string | null;
      useAcl?: boolean;
    },
  ) {
    return this.updateFsProviderUseCase.execute(type, data);
  }

  getAllAnalyticsProviders() {
    return this.getAllAnalyticsProvidersUc.execute();
  }

  getActiveAnalyticsProvider() {
    return this.getActiveAnalyticsProviderUc.execute();
  }

  updateAnalyticsProvider(
    type: string,
    data: { isEnabled?: boolean; config?: any | null },
  ) {
    return this.updateAnalyticsProviderUc.execute(type, data);
  }

  getAllAdsProviders() {
    return this.getAllAdsProvidersUc.execute();
  }

  getActiveAdsProvider() {
    return this.getActiveAdsProviderUc.execute();
  }

  updateAdsProvider(
    type: string,
    data: { isEnabled?: boolean; config?: any | null },
  ) {
    return this.updateAdsProviderUc.execute(type, data);
  }

  getAllCaptchaProviders() {
    return this.getAllCaptchaProvidersUc.execute();
  }

  updateCaptchaProvider(
    type: string,
    data: { siteKey?: string; secretKey?: string; isConfigured?: boolean },
  ) {
    return this.updateCaptchaProviderUc.execute(type, data);
  }

  // Default provider setters
  setDefaultMailProvider(type: string) {
    return this.setDefaultMailUc.execute(type);
  }

  setDefaultCaptchaProvider(type: string) {
    return this.setDefaultCaptchaUc.execute(type);
  }

  // OAuth providers
  getAllOAuthProviders() {
    return this.getAllOAuthProvidersUc.execute();
  }
  updateOAuthProvider(
    type: string,
    data: { isEnabled?: boolean; config?: any },
  ) {
    return this.updateOAuthProviderUc.execute(type, data);
  }
  reorderOAuthProviders(items: { id: string; position: number }[]) {
    return this.reorderOAuthProvidersUc.execute(items);
  }

  getSecuritySettings() {
    return this.settingsService.findAllFlatten('security');
  }

  saveSecuritySettings(dto: SecurityDto) {
    return this.settingsService.save(dto, 'security');
  }

  getIdentitySettings() {
    return this.settingsService.findAllFlatten('identity');
  }

  saveIdentitySettings(dto: IdentityDto) {
    return this.settingsService.save(dto, 'identity');
  }

  // General settings
  getGeneralSettings() {
    return this.settingsService.findAllFlatten('general');
  }

  saveGeneralSettings(dto: { [key: string]: any }) {
    return this.settingsService.save(dto, 'general');
  }

  // File uploads for general settings (logo, favicon)
  uploadGeneralImage(file: Express.Multer.File, user: any) {
    return this.fileStorageService.save(file, user);
  }

  // Discussion settings
  getDiscussionSettings() {
    return this.settingsService.findAllFlatten('discussion');
  }

  saveDiscussionSettings(dto: { [key: string]: any }) {
    return this.settingsService.save(dto, 'discussion');
  }

  // Reading settings
  getReadingSettings() {
    return this.settingsService.findAllFlatten('reading');
  }

  saveReadingSettings(dto: { [key: string]: any }) {
    return this.settingsService.save(dto, 'reading');
  }

  // Content settings
  getContentSettings() {
    return this.settingsService.findAllFlatten('content');
  }

  saveContentSettings(dto: ContentSettingsDto) {
    return this.settingsService.save(dto, 'content');
  }

  // Theming settings
  getThemingSettings() {
    return this.settingsService.findAllFlatten('theming');
  }

  saveThemingSettings(dto: { [key: string]: any }) {
    return this.settingsService.save(dto, 'theming');
  }

  // Social media links settings
  async getSocialMediaLinksSettings() {
    const socialMediaLinks =
      await this.settingsService.findValueByName('socialMediaLinks');
    const availableSocialMediaLinks =
      await this.prisma.socialMediaLink.findMany({
        orderBy: { position: 'asc' },
      });
    return { socialMediaLinks, availableSocialMediaLinks };
  }

  saveSocialMediaLinksSettings(dto: { socialMediaLinks: any[] }) {
    return this.settingsService.save({
      socialMediaLinks: dto.socialMediaLinks,
    }, 'social-media-links');
  }

  // Search engine crawlers settings
  getSearchEngineCrawlersSettings() {
    return this.settingsService.findAllFlatten('search-engine-crawlers');
  }

  saveSearchEngineCrawlersSettings(dto: { [key: string]: any }) {
    return this.settingsService.save(dto, 'search-engine-crawlers');
  }

  async getCookieConsentSettings() {
    return this.settingsService.findValueByName('cookieConsent');
  }

  async saveCookieConsentSettings(dto: CookieConsentDto) {
    await this.settingsService.save({ cookieConsent: dto }, 'security');
  }

  getLicenseSettings() {
    return this.settingsService.findAllFlatten('license');
  }

  saveLicenseSettings(dto: { licenseKey: string }) {
    return this.settingsService.save(dto, 'license');
  }
}
