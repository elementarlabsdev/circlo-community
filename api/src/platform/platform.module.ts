import { Module, Global } from '@nestjs/common';
import { AdminMailProviderController } from '@/platform/infrastructure/controllers/admin.mail-provider.controller';
import { AdminMailController } from '@/platform/infrastructure/controllers/admin.mail.controller';
import { AdminFileStorageController } from '@/platform/infrastructure/controllers/admin.file-storage.controller';
import { AdminAnalyticsProviderController } from '@/platform/infrastructure/controllers/admin.analytics-provider.controller';
import { AdminAdsProviderController } from '@/platform/infrastructure/controllers/admin.ads-provider.controller';
import { AdminCaptchaProviderController } from '@/platform/infrastructure/controllers/admin.captcha-provider.controller';
import { AdminOAuthProviderController } from '@/platform/infrastructure/controllers/admin.oauth-provider.controller';
import { AdminSecurityController } from '@/platform/infrastructure/controllers/admin.security.controller';
import { AdminGeneralController } from './infrastructure/controllers/admin.general.controller';
import { AdminDiscussionController } from './infrastructure/controllers/admin.discussion.controller';
import { AdminReadingController } from './infrastructure/controllers/admin.reading.controller';
import { AdminContentController } from './infrastructure/controllers/admin.content.controller';
import { AdminSocialMediaLinksController } from './infrastructure/controllers/admin.social-media-links.controller';
import { AdminSearchEngineCrawlersController } from '@/platform/infrastructure/controllers/admin.search-engine-crawlers.controller';
import { AdminLayoutController } from './infrastructure/controllers/admin.layout.controller';
import { RobotsTxtController } from './infrastructure/controllers/robots-txt.controller';
import { SitemapController } from '@/platform/infrastructure/controllers/sitemap.controller';
import { UploadController } from './infrastructure/controllers/upload.controller';
import { LayoutController } from './infrastructure/controllers/layout.controller';
import { AdminUsersController } from './infrastructure/controllers/admin.users.controller';
import { AdminAnnouncementsController } from './infrastructure/controllers/admin.announcements.controller';
import { FileStorageService } from '@/platform/application/services/file-storage.service';
import { PlatformService } from './application/services/platform.service';
import { LayoutsService } from './application/services/layouts.service';
import { RobotsTxtService } from '@/platform/application/services/robots-txt.service';
import { SitemapService } from '@/platform/application/services/sitemap.service';
import { LayoutPublicService } from './application/services/layout-public.service';
import { LicenseTypeService } from '@/platform/application/services/license-type.service';
import { SocialMediaLinkService } from '@/platform/application/services/social-media-link.service';
import { MetaTagService } from './application/services/meta-tag.service';
import { UserDataTableService } from '@/platform/application/services/datatable/user-data-table.service';
import { AnnouncementDataTableService } from '@/platform/application/services/datatable/announcement-data-table.service';
import { LayoutsDataTableService } from '@/platform/application/services/datatable/layouts-data-table.service';
import { StudioFollowersDataTableService } from '@/platform/application/services/datatable/studio-followers-data-table.service';
import { RoleDataTableService } from '@/platform/application/services/datatable/role-data-table.service';
import { StudioFollowersController } from '@/platform/infrastructure/controllers/studio-followers.controller';
import { AdminUpdateUserUseCase } from '@/platform/application/use-cases/admin-update-user.use-case';
import { AdminDeleteUserUseCase } from '@/platform/application/use-cases/admin-delete-user.use-case';
import { ListRolesUseCase } from '@/platform/application/use-cases/list-roles.use-case';
import { AdminFindUserByIdUseCase } from '@/platform/application/use-cases/admin-find-user-by-id.use-case';
import { GetAllMailProvidersUseCase } from './application/use-cases/get-all-mail-providers.use-case';
import { GetAllFileStorageProvidersUseCase } from './application/use-cases/get-all-file-storage-providers.use-case';
import { UpdateResendMailProviderUseCase } from '@/platform/application/use-cases/update-resend-mail-provider.use-case';
import { UpdateAwsSesMailProviderUseCase } from '@/platform/application/use-cases/update-aws-ses-mail-provider.use-case';
import { UpdateSendgridMailProviderUseCase } from '@/platform/application/use-cases/update-sendgrid-mail-provider.use-case';
import { UpdateMailProviderUseCase } from '@/platform/application/use-cases/update-mail-provider.use-case';
import { UpdateFileStorageProviderUseCase } from '@/platform/application/use-cases/update-file-storage-provider.use-case';
import { GetAllAnalyticsProvidersUseCase } from '@/platform/application/use-cases/get-all-analytics-providers.use-case';
import { UpdateAnalyticsProviderUseCase } from '@/platform/application/use-cases/update-analytics-provider.use-case';
import { GetAllAdsProvidersUseCase } from '@/platform/application/use-cases/get-all-ads-providers.use-case';
import { UpdateAdsProviderUseCase } from './application/use-cases/update-ads-provider.use-case';
import { GetActiveAdsProviderUseCase } from '@/platform/application/use-cases/get-active-ads-provider.use-case';
import { GetActiveAnalyticsProviderUseCase } from '@/platform/application/use-cases/get-active-analytics-provider.use-case';
import { GetAllCaptchaProvidersUseCase } from '@/platform/application/use-cases/get-all-captcha-providers.use-case';
import { UpdateCaptchaProviderUseCase } from '@/platform/application/use-cases/update-captcha-provider.use-case';
import { SetDefaultCaptchaProviderUseCase } from '@/platform/application/use-cases/set-default-captcha-provider.use-case';
import { SetDefaultMailProviderUseCase } from '@/platform/application/use-cases/set-default-mail-provider.use-case';
// Removed set-default use-cases for analytics and ads
import { GetAllOAuthProvidersUseCase } from '@/platform/application/use-cases/get-all-oauth-providers.use-case';
import { UpdateOAuthProviderUseCase } from '@/platform/application/use-cases/update-oauth-provider.use-case';
import { ReorderOAuthProvidersUseCase } from '@/platform/application/use-cases/reorder-oauth-providers.use-case';
import { MailProviderRepository } from '@/platform/infrastructure/persistence/mail-provider.repository';
import { AdsProviderRepository } from '@/platform/infrastructure/persistence/ads-provider.repository';
import { CaptchaProviderRepository } from '@/platform/infrastructure/persistence/captcha-provider.repository';
import { AnalyticsProviderRepository } from '@/platform/infrastructure/persistence/analytics-provider.repository';
import { FileStorageProviderRepository } from '@/platform/infrastructure/persistence/file-storage-provider.repository';
import { LayoutWidgetDefRepository } from '@/platform/infrastructure/persistence/layout-widget-def.repository';
import { DashboardWidgetDefRepository } from '@/platform/infrastructure/persistence/dashboard-widget-def.repository';
import { MAIL_PROVIDER_REPOSITORY } from '@/platform/domain/repositories/mail-provider.repository.interface';
import { FILE_STORAGE_PROVIDER_REPOSITORY } from '@/platform/domain/repositories/file-storage-provider.repository.interface';
import { ADS_PROVIDER_REPOSITORY } from '@/platform/domain/repositories/ads-provider.repository.interface';
import { CAPTCHA_PROVIDER_REPOSITORY } from '@/platform/domain/repositories/captcha-provider.repository.interface';
import { ANALYTICS_PROVIDER_REPOSITORY } from '@/platform/domain/repositories/analytics-provider.repository.interface';
import { LAYOUT_WIDGET_DEF_REPOSITORY } from '@/platform/domain/repositories/layout-widget-def.repository.interface';
import { DASHBOARD_WIDGET_DEF_REPOSITORY } from '@/platform/domain/repositories/dashboard-widget-def.repository.interface';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './domain/types/file-storage.types';
import {
  CommunityInfoWidgetService,
  DiscussionsWidgetService,
  EventsWidgetService,
  RecommendedChannelsWidgetService,
  RecommendedTopicsWidgetService,
  SocialMediaLinksWidgetService,
  StaffPicsWidgetService,
} from '@/platform/application/services/layout-widgets';
import { LayoutWidgetsService } from '@/platform/application/services/layout-widgets/layout-widgets.service';
import { ActivityService } from '@/platform/application/services/activity.service';
import { LayoutListService } from '@/platform/application/services/layout-list.service';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DefaultGateway } from '@/platform/infrastructure/default.gateway';
import { AdminBrandingController } from '@/platform/infrastructure/controllers/admin.branding.controller';
import { AdminIdentityController } from '@/platform/infrastructure/controllers/admin.identity.controller';
import { AdminStripeController } from '@/platform/infrastructure/controllers/admin.stripe.controller';
import { AdminMonetizationController } from '@/platform/infrastructure/controllers/admin.monetization.controller';
import { AdminCookieConsentController } from '@/platform/infrastructure/controllers/admin.cookie-consent.controller';
import { AdminMetaTagsController } from './infrastructure/controllers/admin.meta-tags.controller';
import { AdminLicenseController } from '@/platform/infrastructure/controllers/admin.license.controller';
import { CookieConsentController } from '@/platform/infrastructure/controllers/cookie-consent.controller';

import { DeleteTemporaryFilesTask } from './infrastructure/cron/delete-temporary-files.task';

@Global()
@Module({
  imports: [],
  controllers: [
    AdminMailController,
    AdminMailProviderController,
    AdminFileStorageController,
    AdminAnalyticsProviderController,
    AdminAdsProviderController,
    AdminCaptchaProviderController,
    AdminOAuthProviderController,
    AdminSecurityController,
    AdminGeneralController,
    AdminDiscussionController,
    AdminReadingController,
    AdminContentController,
    AdminSocialMediaLinksController,
    AdminSearchEngineCrawlersController,
    AdminCookieConsentController,
    CookieConsentController,
    AdminLayoutController,
    RobotsTxtController,
    SitemapController,
    UploadController,
    LayoutController,
    AdminUsersController,
    AdminAnnouncementsController,
    AdminBrandingController,
    AdminIdentityController,
    AdminStripeController,
    AdminMonetizationController,
    AdminMetaTagsController,
    AdminLicenseController,
    StudioFollowersController,
  ],
  providers: [
    DefaultGateway,
    PrismaService,
    FileStorageService,
    ActivityService,
    DeleteTemporaryFilesTask,
    PlatformService,
    LayoutsService,
    LayoutListService,
    RobotsTxtService,
    SitemapService,
    LayoutPublicService,
    LicenseTypeService,
    SocialMediaLinkService,
    MetaTagService,
    UserDataTableService,
    AnnouncementDataTableService,
    LayoutsDataTableService,
    StudioFollowersDataTableService,
    RoleDataTableService,

    // Layout widgets
    CommunityInfoWidgetService,
    DiscussionsWidgetService,
    EventsWidgetService,
    RecommendedChannelsWidgetService,
    RecommendedTopicsWidgetService,
    SocialMediaLinksWidgetService,
    StaffPicsWidgetService,
    LayoutWidgetsService,

    // admin users use cases
    AdminUpdateUserUseCase,
    AdminDeleteUserUseCase,
    ListRolesUseCase,
    AdminFindUserByIdUseCase,

    // use cases
    GetAllMailProvidersUseCase,
    UpdateMailProviderUseCase,
    UpdateResendMailProviderUseCase,
    UpdateAwsSesMailProviderUseCase,
    UpdateSendgridMailProviderUseCase,

    // file storage use cases
    GetAllFileStorageProvidersUseCase,
    UpdateFileStorageProviderUseCase,

    // analytics use cases
    GetAllAnalyticsProvidersUseCase,
    GetActiveAnalyticsProviderUseCase,
    UpdateAnalyticsProviderUseCase,

    // ads use cases
    GetAllAdsProvidersUseCase,
    GetActiveAdsProviderUseCase,
    UpdateAdsProviderUseCase,

    // captcha use cases
    GetAllCaptchaProvidersUseCase,
    UpdateCaptchaProviderUseCase,
    SetDefaultCaptchaProviderUseCase,

    // default provider setters
    SetDefaultMailProviderUseCase,

    // oauth providers use cases
    GetAllOAuthProvidersUseCase,
    UpdateOAuthProviderUseCase,
    ReorderOAuthProvidersUseCase,

    // repositories
    MailProviderRepository,
    AdsProviderRepository,
    CaptchaProviderRepository,
    AnalyticsProviderRepository,
    FileStorageProviderRepository,
    LayoutWidgetDefRepository,
    DashboardWidgetDefRepository,
    {
      provide: MAIL_PROVIDER_REPOSITORY,
      useClass: MailProviderRepository,
    },
    {
      provide: FILE_STORAGE_PROVIDER_REPOSITORY,
      useClass: FileStorageProviderRepository,
    },
    {
      provide: ADS_PROVIDER_REPOSITORY,
      useClass: AdsProviderRepository,
    },
    {
      provide: CAPTCHA_PROVIDER_REPOSITORY,
      useClass: CaptchaProviderRepository,
    },
    {
      provide: ANALYTICS_PROVIDER_REPOSITORY,
      useClass: AnalyticsProviderRepository,
    },
    {
      provide: LAYOUT_WIDGET_DEF_REPOSITORY,
      useClass: LayoutWidgetDefRepository,
    },
    {
      provide: DASHBOARD_WIDGET_DEF_REPOSITORY,
      useClass: DashboardWidgetDefRepository,
    },
  ],
  exports: [
    PrismaService,
    LicenseTypeService,
    SocialMediaLinkService,
    FileStorageService,
    ActivityService,
    DefaultGateway,
    PlatformService,
    CAPTCHA_PROVIDER_REPOSITORY,
    RoleDataTableService,
    MODULE_OPTIONS_TOKEN,
  ],
})
export class PlatformModule extends ConfigurableModuleClass {}
