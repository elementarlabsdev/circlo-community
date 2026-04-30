import { APP_GUARD } from '@nestjs/core';
import { PaidAccountGuard } from '@/payments/infrastructure/guards/paid-account.guard';
import { join, resolve } from 'path';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserMiddleware } from '@/platform/infrastructure/middlewares/user.middleware';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { LocalStorageAdapter } from '@flystorage/local-fs';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import { createKeyv } from '@keyv/redis';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CqrsModule } from '@nestjs/cqrs';
import { AccountModule } from '@/account/account.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { TutorialsModule } from '@/tutorials/tutorials.module';
import { SubscriptionsModule } from '@/subscriptions/subscriptions.module';
import { CommonModule } from '@/common/common.module';
import { MenusModule } from '@/menus/menus.module';
import { SettingsModule } from '@/settings/settings.module';
import { ChannelsModule } from '@/channels/channels.module';
import { PublicationsModule } from '@/publications/publications.module';
import { TopicsModule } from '@/topics/topics.module';
import { IdentityModule } from '@/identity/identity.module';
import { PlatformModule } from '@/platform/platform.module';
import { PagesModule } from '@/pages/pages.module';
import { CommentsModule } from '@/comments/comments.module';
import { BookmarksModule } from '@/bookmarks/bookmarks.module';
import { ReactionsModule } from '@/reactions/reactions.module';
import { DashboardModule } from '@/dashboard/dashboard.module';
import { AvatarService } from '@/common/application/services/avatar.service';
import { MediaModule } from '@/media/media.module';
import { ThreadsModule } from '@/threads/threads.module';
import { FeedModule } from '@/feed/feed.module';
import { ComplaintsModule } from '@/complaints/complaints.module';
import { AnnouncementsModule } from '@/announcements/announcements.module';
import { HttpModule } from '@nestjs/axios';
import { PaymentsModule } from '@/payments/payments.module';
import { ImageDesignModule } from '@/image-design/image-design.module';
import { CreditsModule } from '@/credits/credits.module';
import {
  I18nModule,
  AcceptLanguageResolver,
  HeaderResolver,
  QueryResolver,
} from 'nestjs-i18n';
import { MailModule } from '@/mail/mail.module';
import { TextQualityModule } from '@/text-quality/text-quality.module';

import { CaslModule } from '@/casl/casl.module';

@Module({
  imports: [
    CaslModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('LOCALE'),
        loaderOptions: {
          path: configService.getOrThrow('ENV') === 'dev'
            ? join(process.cwd(), 'src/i18n/')
            : join(process.cwd(), 'dist/i18n/'),
          watch: configService.getOrThrow('ENV') === 'dev',
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        HeaderResolver,
      ],
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: '365d' },
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        return {
          stores: [createKeyv(configService.getOrThrow('REDIS_URL'))],
        };
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.getOrThrow('REDIS_URL'),
        },
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: resolve(process.cwd(), 'public'),
      serveStaticOptions: { index: false },
    }),
    ScheduleModule.forRoot(),
    CqrsModule.forRoot(),
    PlatformModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        adapters: {
          local: new LocalStorageAdapter(
            resolve(process.cwd(), 'public/media'),
            {
              publicUrlOptions: {
                baseUrl:
                  configService.getOrThrow('LOCAL_FILE_STORAGE_BASE_URL') +
                  '/public/media',
              },
            },
          ),
        },
      }),
      inject: [ConfigService],
    }),
    MailModule,
    PaymentsModule,
    AccountModule,
    NotificationsModule,
    TutorialsModule,
    SubscriptionsModule,
    CommonModule,
    MenusModule,
    SettingsModule,
    ChannelsModule,
    PublicationsModule,
    TopicsModule,
    IdentityModule,
    PagesModule,
    CommentsModule,
    BookmarksModule,
    ReactionsModule,
    DashboardModule,
    MediaModule,
    ThreadsModule,
    FeedModule,
    ComplaintsModule,
    AnnouncementsModule,
    ImageDesignModule,
    CreditsModule,
    TextQualityModule,
  ],
  providers: [
    AuthGuard,
    AvatarService,
    {
      provide: APP_GUARD,
      useClass: PaidAccountGuard,
    },
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(UserMiddleware).forRoutes('*path');
  }
}
