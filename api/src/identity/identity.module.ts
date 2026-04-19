import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CreateUserUseCase } from '@/identity/application/use-cases/create-user.use-case';
import { SyncCookiesUseCase } from '@/identity/application/use-cases/sync-cookies.use-case';
import { AdminCreateUserUseCase } from '@/identity/application/use-cases/admin-create-user.use-case';
import { RoleRepository } from '@/identity/infrastructure/persistence/role.repository';
import { ROLE_REPOSITORY } from '@/identity/domain/repositories/role-repository.interface';
import { USER_REPOSITORY } from '@/identity/domain/repositories/user-repository.interface';
import { UserRepository } from '@/identity/infrastructure/persistence/user.repository';
import { LoginUseCase } from '@/identity/application/use-cases/login.use-case';
import { IdentityService } from '@/identity/application/services/identity.service';
import { IdentityController } from '@/identity/infrastructure/controllers/identity.controller';
import { ProfileController } from '@/identity/infrastructure/controllers/profile.controller';
import { UserDonationsController } from '@/identity/infrastructure/controllers/user-donations.controller';
import { UsersService } from '@/identity/application/services/users.service';
import { OAUTH_PROVIDER_REPOSITORY } from '@/identity/domain/repositories/oauth-provider.repository.interface';
import { OAuthProviderRepository } from '@/identity/infrastructure/persistence/oauth-provider.repository';
import { GetLoginPageSettingsUseCase } from '@/identity/application/use-cases/get-login-page-settings.use-case';
import { COOKIE_SETTINGS_REPOSITORY } from '@/identity/domain/repositories/cookie-settings-repository.interface';
import { CookieSettingsRepository } from '@/identity/infrastructure/persistence/cookie-settings.repository';
import { PageSettingsService } from '@/identity/application/services/page-settings.service';
import { PageSettingsController } from '@/identity/infrastructure/controllers/page-settings.controller';
import { GetRegisterPageSettingsUseCase } from '@/identity/application/use-cases/get-register-page-settings.use-case';
import { SendEmailVerificationCodeUseCase } from '@/identity/application/use-cases/send-email-verification-code.use-case';
import { IsFirstUserUseCase } from '@/identity/application/use-cases/is-first-user.use-case';
import { EMAIL_VERIFICATION_REPOSITORY } from '@/identity/domain/repositories/email-verification-repository.interface';
import { EmailVerificationRepository } from '@/identity/infrastructure/persistence/email-verification.repository';
import { LOGIN_SESSION_REPOSITORY } from '@/identity/domain/repositories/login-session-repository.interface';
import { LoginSessionRepository } from '@/identity/infrastructure/persistence/login-session.repository';
import { FindUserByIdUseCase } from '@/identity/application/use-cases/find-user-by-id.use-case';
import { FindUserByUsernameUseCase } from '@/identity/application/use-cases/find-user-by-username.use-case';
import { FindUserByEmailUseCase } from '@/identity/application/use-cases/find-user-by-email.use-case';
import { GetEmailByHashUseCase } from '@/identity/application/use-cases/get-email-by-hash.use-case';
import { VerifyEmailUseCase } from '@/identity/application/use-cases/verify-email.use-case';
import { ResendEmailVerificationUseCase } from '@/identity/application/use-cases/resend-email-verification.use-case';
import { SetUserPasswordUseCase } from '@/identity/application/use-cases/set-user-password.use-case';
import { CountUsersUseCase } from '@/identity/application/use-cases/count-users.use-case';
import { IsEmailTakenUseCase } from '@/identity/application/use-cases/is-email-taken.use-case';
import { IsUsernameTakenUseCase } from '@/identity/application/use-cases/is-username-taken.use-case';
import { GetCreatedTutorialsUseCase } from '@/identity/application/use-cases/get-created-tutorials.use-case';
import { AddLoginHistoryUseCase } from '@/identity/application/use-cases/add-login-history.use-case';
import { GetUserProfileUseCase } from '@/identity/application/use-cases/get-user-profile.use-case';
import { DeactivateUserUseCase } from '@/identity/application/use-cases/deactivate-user.use-case';
import { DeleteCurrentUserUseCase } from '@/identity/application/use-cases/delete-current-user.use-case';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';
import { EmailVerificationController } from '@/identity/infrastructure/controllers/email-verification.controller';
import { LogoutController } from '@/identity/infrastructure/controllers/logout.controller';
import { GithubOauthController } from '@/identity/infrastructure/controllers/github-oauth.controller';
import { GoogleOauthController } from '@/identity/infrastructure/controllers/google-oauth.controller';
import { FacebookOauthController } from '@/identity/infrastructure/controllers/facebook-oauth.controller';
import { XOauthController } from '@/identity/infrastructure/controllers/x-oauth.controller';
import { AuthService } from '@/identity/application/services/auth.service';
import { AbilityFactory } from '@/identity/application/services/ability.factory';
import { PoliciesGuard } from '@/identity/infrastructure/guards/policies.guard';
import { GithubStrategy } from '@/identity/infrastructure/strategy/github.strategy';
import { GoogleStrategy } from '@/identity/infrastructure/strategy/google.strategy';
import { FacebookStrategy } from '@/identity/infrastructure/strategy/facebook.strategy';
import { XStrategy } from '@/identity/infrastructure/strategy/x.strategy';
import { EmailVerificationCleanupCron } from '@/identity/infrastructure/cron/email-verification-cleanup.cron';
import { EmailVerifiedController } from '@/identity/infrastructure/controllers/email-verified.controller';
import { ForgotPasswordController } from '@/identity/infrastructure/controllers/forgot-password.controller';
import { SendResetPasswordCodeUseCase } from '@/identity/application/use-cases/send-reset-password-code.use-case';
import { PASSWORD_RESET_REPOSITORY } from '@/identity/domain/repositories/password-reset-repository.interface';
import { PasswordResetRepository } from '@/identity/infrastructure/persistence/password-reset.repository';
import { PasswordVerificationController } from '@/identity/infrastructure/controllers/password-verification.controller';
import { PasswordRestoredController } from '@/identity/infrastructure/controllers/password-restored.controller';
import { SetNewPasswordController } from '@/identity/infrastructure/controllers/set-new-password.controller';
import { RolesController } from '@/identity/infrastructure/controllers/roles.controller';
import {
  OwnablePolicyProvider,
  DraftOnlyPolicyProvider,
} from './application/services/policies.provider';
import { RolePolicyProvider } from './application/services/role-policy.provider';
import { ResourceAccessPolicyProvider } from './application/services/resource-access-policy.provider';
import {
  IPolicyProvider,
  POLICY_PROVIDERS,
} from './application/services/policy-provider.interface';

@Global()
@Module({
  imports: [PassportModule.register({ session: false })],
  controllers: [
    IdentityController,
    PageSettingsController,
    ProfileController,
    UserDonationsController,
    EmailVerificationController,
    LogoutController,
    GithubOauthController,
    GoogleOauthController,
    FacebookOauthController,
    XOauthController,
    EmailVerifiedController,
    ForgotPasswordController,
    PasswordVerificationController,
    PasswordRestoredController,
    SetNewPasswordController,
    RolesController,
  ],
  providers: [
    // RBAC/ABAC
    AbilityFactory,
    // Guards
    PoliciesGuard,
    // use cases
    CreateUserUseCase,
    SyncCookiesUseCase,
    GetLoginPageSettingsUseCase,
    GetRegisterPageSettingsUseCase,
    AdminCreateUserUseCase,
    LoginUseCase,
    GetEmailByHashUseCase,
    VerifyEmailUseCase,
    ResendEmailVerificationUseCase,
    SendEmailVerificationCodeUseCase,
    SendResetPasswordCodeUseCase,
    IsFirstUserUseCase,
    SubscriptionsService,
    AuthService,
    GithubStrategy,
    GoogleStrategy,
    FacebookStrategy,
    XStrategy,
    EmailVerificationCleanupCron,

    // user query/update use-cases (migrated from UsersService)
    FindUserByIdUseCase,
    FindUserByUsernameUseCase,
    FindUserByEmailUseCase,
    SetUserPasswordUseCase,
    CountUsersUseCase,
    IsEmailTakenUseCase,
    IsUsernameTakenUseCase,
    GetCreatedTutorialsUseCase,
    AddLoginHistoryUseCase,
    GetUserProfileUseCase,

    // account management
    DeactivateUserUseCase,
    DeleteCurrentUserUseCase,

    // services
    IdentityService,
    UsersService,
    PageSettingsService,

    ResourceAccessPolicyProvider,
    DraftOnlyPolicyProvider,
    RolePolicyProvider,

    {
      provide: POLICY_PROVIDERS,
      useFactory: (
        resourceAccessPolicy: ResourceAccessPolicyProvider,
        draftOnlyPolicy: DraftOnlyPolicyProvider,
        rolePolicy: RolePolicyProvider,
      ) => {
        if (!rolePolicy) {
          throw new Error('IdentityModule: RolePolicyProvider is missing!');
        }

        const providers: IPolicyProvider[] = (
          [
            new OwnablePolicyProvider([
              'Publication',
              'Tutorial',
              'ChannelEntity',
              'TopicEntity',
            ]),
            draftOnlyPolicy,
            resourceAccessPolicy,
            rolePolicy,
          ] as (IPolicyProvider | undefined)[]
        ).filter((p): p is IPolicyProvider => !!p);

        return providers;
      },
      inject: [
        ResourceAccessPolicyProvider,
        DraftOnlyPolicyProvider,
        RolePolicyProvider,
      ],
    },

    // repositories
    UserRepository,
    RoleRepository,
    OAuthProviderRepository,
    EmailVerificationRepository,
    CookieSettingsRepository,
    LoginSessionRepository,
    PasswordResetRepository,
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: OAUTH_PROVIDER_REPOSITORY,
      useClass: OAuthProviderRepository,
    },
    {
      provide: EMAIL_VERIFICATION_REPOSITORY,
      useClass: EmailVerificationRepository,
    },
    {
      provide: COOKIE_SETTINGS_REPOSITORY,
      useClass: CookieSettingsRepository,
    },
    {
      provide: LOGIN_SESSION_REPOSITORY,
      useClass: LoginSessionRepository,
    },
    {
      provide: PASSWORD_RESET_REPOSITORY,
      useClass: PasswordResetRepository,
    },
  ],
  exports: [
    AbilityFactory,
    PoliciesGuard,
    UsersService,
    AdminCreateUserUseCase,
    DeactivateUserUseCase,
    DeleteCurrentUserUseCase,
    GetUserProfileUseCase,
  ],
})
export class IdentityModule {}
