import { Injectable } from '@nestjs/common';

import { UserEmail } from '../../domain/value-objects/user-email.vo';
import { UserProfile } from '../../domain/value-objects/user-profile.vo';
import { UserAccountStatus } from '../../domain/value-objects/user-account-status.vo';
import { UserCounters } from '../../domain/value-objects/user-counters.vo';
import { UserSecuritySettings } from '../../domain/value-objects/user-security-settings.vo';
import { UserNotificationSettings } from '../../domain/value-objects/user-notification-settings.vo';
import { UserTimestamps } from '../../domain/value-objects/user-timestamps.vo';
import { UserRepositoryInterface } from '@/identity/domain/repositories/user-repository.interface';
import { PrismaService } from '@/platform/application/services/prisma.service';
import {
  User as PrismaUser,
  NotificationSettings as PrismaNotificationSettings,
  SecuritySettings as PrismaSecuritySettings,
} from '@prisma/client';
import { Role } from '@/identity/domain/entities/role.entity';
import { User } from '@/identity/domain/entities/user.entity';

const DEFAULT_DASHBOARD_WIDGETS = [
  {
    id: '0',
    x: 0,
    y: 0,
    w: 3,
    h: 5,
    wLg: 6,
    resizable: false,
    type: 'publications',
    widget: {},
  },
  {
    id: '1',
    x: 3,
    y: 0,
    w: 3,
    h: 5,
    wLg: 6,
    resizable: false,
    type: 'followers',
    widget: {},
  },
  {
    id: '2',
    x: 6,
    y: 0,
    w: 3,
    h: 5,
    wLg: 6,
    resizable: false,
    type: 'reactions',
    widget: {},
  },
  {
    id: '3',
    x: 9,
    y: 0,
    w: 3,
    h: 5,
    wLg: 6,
    resizable: false,
    type: 'views',
    widget: {},
  },
  {
    id: '4',
    x: 0,
    y: 5,
    w: 4,
    h: 20,
    wLg: 12,
    resizable: true,
    type: 'latestPublications',
    widget: {},
  },
  {
    id: '5',
    x: 4,
    y: 5,
    w: 4,
    h: 20,
    wLg: 12,
    resizable: true,
    type: 'latestTutorials',
    widget: {},
  },
  {
    id: '6',
    x: 8,
    y: 5,
    w: 4,
    h: 20,
    wLg: 12,
    resizable: true,
    type: 'activity',
    widget: {},
  },
] as const;

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const userFromDb = await this.prisma.user.findFirst({
      where: { id },
      include: {
        notificationSettings: true,
        securitySettings: true,
        role: {
          include: {
            permissions: true,
          },
        },
      },
      omit: { password: false, openAIApiKey: false, email: false },
    } as any);
    return userFromDb ? this.mapToDomain(userFromDb as any) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userFromDb = await this.prisma.user.findFirst({
      where: { email },
      include: {
        notificationSettings: true,
        securitySettings: true,
        role: {
          include: {
            permissions: true,
          },
        },
      },
      omit: { password: false, openAIApiKey: false, email: false },
    } as any);
    return userFromDb ? this.mapToDomain(userFromDb as any) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const userFromDb = await this.prisma.user.findFirst({
      where: { username },
      include: {
        notificationSettings: true,
        securitySettings: true,
        role: {
          include: {
            permissions: true,
          },
        },
      },
      omit: { password: false, openAIApiKey: false, email: false },
    } as any);
    return userFromDb ? this.mapToDomain(userFromDb as any) : null;
  }

  async save(user: User): Promise<void> {
    const data = user.toPersistence();

    const {
      roleId,
      notificationSettings,
      securitySettings,
      ...scalarUserData
    } = data;

    const userDataWithRelations = {
      ...scalarUserData,
      role: {
        connect: { id: roleId },
      },
    };

    const accountStatusData = {
      isBlocked: user.accountStatus.isBlocked,
      verified: user.accountStatus.verified,
      isSuperAdmin: user.accountStatus.isSuperAdmin,
      isDeactivated: user.accountStatus.isDeactivated,
      hasPaidAccount: user.accountStatus.hasPaidAccount,
    };

    await this.prisma.user.upsert({
      where: { id: data.id },
      create: {
        ...accountStatusData,
        ...userDataWithRelations,
        notificationSettings: notificationSettings
          ? { create: notificationSettings }
          : undefined,
        securitySettings: securitySettings
          ? { create: securitySettings }
          : undefined,
      },
      update: {
        ...accountStatusData,
        ...userDataWithRelations,
        notificationSettings: notificationSettings
          ? {
              upsert: {
                create: notificationSettings,
                update: notificationSettings,
              },
            }
          : undefined,
        securitySettings: securitySettings
          ? {
              upsert: {
                create: securitySettings,
                update: securitySettings,
              },
            }
          : undefined,
      },
    });

    // Ensure UserDashboard record exists for this user with default layout
    await this.prisma.userDashboard.upsert({
      where: { userId: data.id },
      create: { userId: data.id, layout: DEFAULT_DASHBOARD_WIDGETS as any },
      update: {},
    });
  }

  countAll(): Promise<number> {
    return this.prisma.user.count();
  }

  private mapToDomain(
    userFromDb: PrismaUser & {
      notificationSettings: PrismaNotificationSettings | null;
      securitySettings: PrismaSecuritySettings | null;
      role?: any;
    },
  ): User {
    const email = UserEmail.create(userFromDb.email);

    const profile = UserProfile.create({
      name: userFromDb.name,
      username: userFromDb.username,
      jobTitle: userFromDb.jobTitle,
      bio: userFromDb.bio,
      location: userFromDb.location,
      avatarUrl: userFromDb.avatarUrl,
      birthDate: userFromDb.birthDate,
      gender: userFromDb.gender,
      preferredColorScheme: userFromDb.preferredColorScheme,
    });

    // Support older Prisma client typings that may not yet include `isDeactivated`
    const isDeactivated = (userFromDb as any)?.isDeactivated ?? false;

    const accountStatus = UserAccountStatus.create({
      isBlocked: userFromDb.isBlocked,
      verified: userFromDb.verified,
      isSuperAdmin: userFromDb.isSuperAdmin,
      isDeactivated,
      hasPaidAccount: (userFromDb as any).hasPaidAccount ?? false,
    });

    const counters = UserCounters.create({
      publications: userFromDb.publicationsCount,
      tutorials: (userFromDb as any).tutorialsCount ?? 0,
      comments: userFromDb.commentsCount,
      followers: userFromDb.followersCount,
      credits: userFromDb.credits,
    });

    const securitySettings = UserSecuritySettings.create({
      mfaConfigured: userFromDb.securitySettings?.mfaConfigured ?? false,
      mfaEnabled: userFromDb.securitySettings?.mfaEnabled ?? false,
      openAIApiKey: userFromDb.openAIApiKey,
    });

    const timestamps = UserTimestamps.reconstitute({
      createdAt: userFromDb.createdAt,
      updatedAt: userFromDb.updatedAt,
      lastActivityAt: userFromDb.lastActivityAt,
      notificationsViewedAt: userFromDb.notificationsViewedAt,
    });

    const notificationSettingsProps = userFromDb.notificationSettings
      ? {
          enableWeeklyNewsletterEmails:
            userFromDb.notificationSettings.enableWeeklyNewsletterEmails,
          enablePeriodicDigestOfTopPostsFromMyTopics:
            userFromDb.notificationSettings
              .enablePeriodicDigestOfTopPostsFromMyTopics,
          enableEmailWhenSomeoneRepliesToMeInCommentThread:
            userFromDb.notificationSettings
              .enableEmailWhenSomeoneRepliesToMeInCommentThread,
          enableEmailWhenSomeoneNewFollowsMe:
            userFromDb.notificationSettings.enableEmailWhenSomeoneNewFollowsMe,
          enableEmailWhenSomeoneMentionsMe:
            userFromDb.notificationSettings.enableEmailWhenSomeoneMentionsMe,
          enableEmailWhenIReceiveBadge:
            userFromDb.notificationSettings.enableEmailWhenIReceiveBadge,
          enablePushNotificationWhenSomeoneRepliesToMeInCommentThread:
            userFromDb.notificationSettings
              .enablePushNotificationWhenSomeoneRepliesToMeInCommentThread,
          enablePushNotificationWhenSomeoneMentionsMe:
            userFromDb.notificationSettings
              .enablePushNotificationWhenSomeoneMentionsMe,
          notificationsWhenSomeoneReactsToMyContent:
            userFromDb.notificationSettings
              .notificationsWhenSomeoneReactsToMyContent,
          muteAllNotifications:
            userFromDb.notificationSettings.muteAllNotifications,
        }
      : {};

    const notificationSettings = UserNotificationSettings.create(
      notificationSettingsProps,
    );

    let role: Role | undefined;
    if (userFromDb.role) {
      role = new Role(
        userFromDb.role.id,
        userFromDb.role.type,
        userFromDb.role.name,
        userFromDb.role.isBuiltIn,
        userFromDb.role.permissions || [],
        userFromDb.role.parentId,
      );
    }

    return User.reconstitute({
      id: userFromDb.id,
      email: email,
      passwordHash: userFromDb.password,
      roleId: userFromDb.roleId,
      role: role,
      profile: profile,
      accountStatus: accountStatus,
      counters: counters,
      securitySettings: securitySettings,
      notificationSettings: notificationSettings,
      timestamps: timestamps,
      registrationProvider: userFromDb.registrationProvider,
      preferredColorScheme: userFromDb.preferredColorScheme,
      cookieConsent: (userFromDb as any).cookieConsent ?? false,
      cookiePreferences: (userFromDb as any).cookiePreferences,
    });
  }
}
