import { Global, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { RequestEmailChangeUseCase } from './application/use-cases/request-email-change.use-case';
import { ConfirmEmailChangeUseCase } from './application/use-cases/confirm-email-change.use-case';
import { PrismaEmailChangeRepository } from './infrastructure/repositories/prisma-email-change.repository';
import { EMAIL_CHANGE_REPOSITORY } from './domain/repositories/email-change-repository.interface';
import { ChannelsService } from '@/channels/application/services/channels.service';
import { ColorSchemeController } from '@/account/infrastructure/controllers/color-scheme.controller';
import { MyProfileController } from '@/account/infrastructure/controllers/my-profile.controller';
import { NotificationsController } from '@/account/infrastructure/controllers/notifications.controller';
import { CookieController } from '@/account/infrastructure/controllers/cookie.controller';
import { SecurityController } from '@/account/infrastructure/controllers/security.controller';
import { DangerZoneController } from '@/account/infrastructure/controllers/danger-zone.controller';
import { SaveColorSchemeUseCase } from '@/account/application/use-cases/save-color-scheme.use-case';
import { GetCookieSettingsUseCase } from '@/account/application/use-cases/get-cookie-settings.use-case';
import { SaveCookieSettingsUseCase } from '@/account/application/use-cases/save-cookie-settings.use-case';
import { GetMyProfileUseCase } from '@/account/application/use-cases/get-my-profile.use-case';
import { SaveMyProfileUseCase } from '@/account/application/use-cases/save-my-profile.use-case';
import { ValidateUsernameUseCase } from '@/account/application/use-cases/validate-username.use-case';
import { UploadAvatarUseCase } from '@/account/application/use-cases/upload-avatar.use-case';
import { GetNotificationSettingsUseCase } from '@/account/application/use-cases/get-notification-settings.use-case';
import { SaveNotificationSettingsUseCase } from '@/account/application/use-cases/save-notification-settings.use-case';
import { GetSecuritySettingsUseCase } from '@/account/application/use-cases/get-security-settings.use-case';
import { ChangePasswordUseCase } from '@/account/application/use-cases/change-password.use-case';
import { DeleteOAuthProviderUseCase } from '@/account/application/use-cases/delete-oauth-provider.use-case';
import { FeaturedImageService } from '@/common/application/services/featured-image.service';
import { DonationsController } from '@/account/infrastructure/controllers/donations.controller';
import { ListMyDonationLinksUseCase } from '@/account/application/use-cases/donations/list-my-donation-links.use-case';
import { CreateDonationLinkUseCase } from '@/account/application/use-cases/donations/create-donation-link.use-case';
import { UpdateDonationLinkUseCase } from '@/account/application/use-cases/donations/update-donation-link.use-case';
import { DeleteDonationLinkUseCase } from '@/account/application/use-cases/donations/delete-donation-link.use-case';
import { BatchSaveDonationLinksUseCase } from '@/account/application/use-cases/donations/batch-save-donation-links.use-case';

@Global()
@Module({
  imports: [MulterModule],
  controllers: [
    MyProfileController,
    NotificationsController,
    CookieController,
    SecurityController,
    ColorSchemeController,
    DangerZoneController,
    // donations
    DonationsController,
  ],
  providers: [
    ChannelsService,
    FeaturedImageService,
    RequestEmailChangeUseCase,
    ConfirmEmailChangeUseCase,
    SaveColorSchemeUseCase,
    GetCookieSettingsUseCase,
    SaveCookieSettingsUseCase,
    GetMyProfileUseCase,
    SaveMyProfileUseCase,
    ValidateUsernameUseCase,
    UploadAvatarUseCase,
    // notifications
    GetNotificationSettingsUseCase,
    SaveNotificationSettingsUseCase,
    // security
    GetSecuritySettingsUseCase,
    ChangePasswordUseCase,
    DeleteOAuthProviderUseCase,
    // donations
    ListMyDonationLinksUseCase,
    CreateDonationLinkUseCase,
    UpdateDonationLinkUseCase,
    DeleteDonationLinkUseCase,
    BatchSaveDonationLinksUseCase,
    { provide: EMAIL_CHANGE_REPOSITORY, useClass: PrismaEmailChangeRepository },
  ],
})
export class AccountModule {}
