import { BadRequestException } from '@nestjs/common';
import {
  UserProfile,
  UserProfileProps,
} from '../value-objects/user-profile.vo';
import {
  UserAccountStatus,
  UserAccountStatusProps,
} from '../value-objects/user-account-status.vo';
import { UserCounters } from '../value-objects/user-counters.vo';
import { UserSecuritySettings } from '../value-objects/user-security-settings.vo';
import {
  UserNotificationSettings,
  UserNotificationSettingsProps,
} from '../value-objects/user-notification-settings.vo';
import { UserTimestamps } from '../value-objects/user-timestamps.vo';
import { UserEmail } from '../value-objects/user-email.vo';
import * as bcrypt from 'bcrypt';

import { Role } from './role.entity';

export interface UserCreateProps {
  id: string;
  email: string;
  passwordHash: string;
  roleId: string;
  role?: Role;
  profile: UserProfileProps;
  registrationProvider: string;
  accountStatus?: Partial<UserAccountStatusProps>;
  subscriptionExpiresAt?: Date | null;
}

interface UserProps {
  id: string;
  email: UserEmail;
  passwordHash: string;
  roleId: string;
  role?: Role;
  profile: UserProfile;
  accountStatus: UserAccountStatus;
  counters: UserCounters;
  securitySettings: UserSecuritySettings;
  notificationSettings: UserNotificationSettings;
  timestamps: UserTimestamps;
  registrationProvider: string;
  preferredColorScheme: string;
  cookieConsent: boolean;
  cookiePreferences?: any;
  subscriptionExpiresAt?: Date | null;
}

export class User {
  public readonly id: string;
  public readonly email: UserEmail;
  public readonly roleId: string;
  public readonly role?: Role;

  private _passwordHash: string;
  private registrationProvider: string;
  private _profile: UserProfile;
  private _accountStatus: UserAccountStatus;
  private _counters: UserCounters;
  private _securitySettings: UserSecuritySettings;
  private _notificationSettings: UserNotificationSettings;
  private _timestamps: UserTimestamps;
  private _preferredColorScheme: string;
  private _cookieConsent: boolean;
  private _cookiePreferences: any;
  private _subscriptionExpiresAt: Date | null;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.roleId = props.roleId;
    this.role = props.role;
    this._passwordHash = props.passwordHash;
    this._profile = props.profile;
    this._accountStatus = props.accountStatus;
    this._counters = props.counters;
    this._securitySettings = props.securitySettings;
    this._notificationSettings = props.notificationSettings;
    this._timestamps = props.timestamps;
    this.registrationProvider = props.registrationProvider;
    this._preferredColorScheme = props.preferredColorScheme;
    this._cookieConsent = props.cookieConsent ?? false;
    this._cookiePreferences = props.cookiePreferences || {};
    this._subscriptionExpiresAt = props.subscriptionExpiresAt ?? null;
  }

  public static create(props: UserCreateProps): User {
    const email = UserEmail.create(props.email);
    const profile = UserProfile.create(props.profile);
    const accountStatus = UserAccountStatus.create(props.accountStatus);
    const counters = UserCounters.create();
    const securitySettings = UserSecuritySettings.create();
    const notificationSettings = UserNotificationSettings.create();
    const timestamps = UserTimestamps.create();

    return new User({
      id: props.id,
      email: email,
      passwordHash: props.passwordHash,
      roleId: props.roleId,
      profile: profile,
      accountStatus: accountStatus,
      counters: counters,
      securitySettings: securitySettings,
      notificationSettings: notificationSettings,
      timestamps: timestamps,
      registrationProvider: props.registrationProvider,
      preferredColorScheme: 'light',
      cookieConsent: false,
      cookiePreferences: {},
      subscriptionExpiresAt: props.subscriptionExpiresAt,
    });
  }

  public static reconstitute(props: UserProps): User {
    return new User(props);
  }

  private touch(): void {
    this._timestamps = this._timestamps.touch();
  }

  public block(): void {
    this._accountStatus = this._accountStatus.block();
    this.touch();
  }

  public unblock(): void {
    this._accountStatus = this._accountStatus.unblock();
    this.touch();
  }

  public setPaidAccount(hasPaidAccount: boolean): void {
    this._accountStatus = UserAccountStatus.create({
      ...this._accountStatus,
      hasPaidAccount,
    });
    this.touch();
  }

  public markAsVerified(): void {
    this._accountStatus = this._accountStatus.verify();
    this.touch();
  }

  public updateProfile(props: Partial<UserProfileProps>): void {
    this._profile = this._profile.update(props);
    this.touch();
  }

  public changePassword(newPasswordHash: string): void {
    if (!newPasswordHash || newPasswordHash.trim() === '') {
      throw new BadRequestException('Password hash must not be empty');
    }
    this._passwordHash = newPasswordHash;
    this.touch();
  }

  public async verifyPassword(plainTextPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, this._passwordHash);
  }

  public enableMfa(): void {
    this._securitySettings = this._securitySettings.enableMfa();
    this.touch();
  }

  public updateNotificationSettings(
    props: UserNotificationSettingsProps,
  ): void {
    this._notificationSettings = this._notificationSettings.update(props);
    this.touch();
  }

  public recordActivity(): void {
    this._timestamps = this._timestamps.recordActivity();
    this.touch();
  }

  public recordNotificationsViewed(): void {
    this._timestamps = this._timestamps.recordNotificationsViewed();
    this.touch();
  }

  public onNewFollower(): void {
    this._counters = this._counters.incrementFollowers();
    this.touch();
  }

  public onPublicationCreated(): void {
    this._counters = this._counters.incrementPublications();
    this.touch();
  }

  public updateCookieConsent(consent: boolean, preferences?: any): void {
    this._cookieConsent = consent;
    if (preferences !== undefined) {
      this._cookiePreferences = preferences;
    }
    this.touch();
  }

  get passwordHash() {
    return this._passwordHash;
  }
  get profile() {
    return this._profile;
  }
  get accountStatus() {
    return this._accountStatus;
  }
  get counters() {
    return this._counters;
  }
  get securitySettings() {
    return this._securitySettings;
  }
  get notificationSettings() {
    return this._notificationSettings;
  }
  get timestamps() {
    return this._timestamps;
  }
  get isBlocked() {
    return this._accountStatus.isBlocked;
  }
  get verified() {
    return this._accountStatus.verified;
  }
  get isSuperAdmin() {
    return this._accountStatus.isSuperAdmin;
  }
  get isDeactivated() {
    return this._accountStatus.isDeactivated;
  }
  get hasPaidAccount() {
    return this._accountStatus.hasPaidAccount;
  }
  get username() {
    return this._profile.username;
  }
  get avatarUrl() {
    return this._profile.avatarUrl;
  }
  get preferredColorScheme() {
    return this._preferredColorScheme;
  }
  get name() {
    return this._profile.name;
  }

  get publicationsCount() {
    return this._counters.publications;
  }

  get tutorialsCount() {
    return this._counters.tutorials;
  }

  get commentsCount() {
    return this._counters.comments;
  }

  get followersCount() {
    return this._counters.followers;
  }

  get subscriptionType() {
    return 'user';
  }

  get cookieConsent() {
    return this._cookieConsent;
  }

  get cookiePreferences() {
    return this._cookiePreferences;
  }

  get subscriptionExpiresAt() {
    return this._subscriptionExpiresAt;
  }

  // polarAccessToken has been removed from User domain model

  public toPersistence() {
    const notificationSettingsData = {
      enableWeeklyNewsletterEmails: this._notificationSettings.weeklyNewsletter,
      enablePeriodicDigestOfTopPostsFromMyTopics:
        this._notificationSettings.topicDigest,
      enableEmailWhenSomeoneRepliesToMeInCommentThread:
        this._notificationSettings.emailOnReply,
      enableEmailWhenSomeoneNewFollowsMe:
        this._notificationSettings.emailOnNewFollower,
      enableEmailWhenSomeoneMentionsMe:
        this._notificationSettings.emailOnMention,
      enableEmailWhenIReceiveBadge: this._notificationSettings.emailOnBadge,
      enablePushNotificationWhenSomeoneRepliesToMeInCommentThread:
        this._notificationSettings.pushOnReply,
      enablePushNotificationWhenSomeoneMentionsMe:
        this._notificationSettings.pushOnMention,
      notificationsWhenSomeoneReactsToMyContent:
        this._notificationSettings.onReaction,
      muteAllNotifications: this._notificationSettings.muteAll,
    };

    const securitySettingsData = {
      mfaConfigured: this._securitySettings.mfaConfigured,
      mfaEnabled: this._securitySettings.mfaEnabled,
    };

    return {
      id: this.id,
      email: this.email.value,
      password: this._passwordHash,
      roleId: this.roleId,
      name: this._profile.name,
      username: this._profile.username,
      jobTitle: this._profile.jobTitle,
      bio: this._profile.bio,
      location: this._profile.location,
      avatarUrl: this._profile.avatarUrl,
      birthDate: this._profile.birthDate,
      gender: this._profile.gender,
      isBlocked: this._accountStatus.isBlocked,
      verified: this._accountStatus.verified,
      isSuperAdmin: this._accountStatus.isSuperAdmin,
      isDeactivated: this._accountStatus.isDeactivated,
      hasPaidAccount: this._accountStatus.hasPaidAccount,
      publicationsCount: this._counters.publications,
      tutorialsCount: this._counters.tutorials,
      commentsCount: this._counters.comments,
      followersCount: this._counters.followers,
      credits: this._counters.credits,
      openAIApiKey: this._securitySettings.openAIApiKey,
      createdAt: this._timestamps.createdAt,
      updatedAt: this._timestamps.updatedAt,
      lastActivityAt: this._timestamps.lastActivityAt,
      notificationsViewedAt: this._timestamps.notificationsViewedAt,
      registrationProvider: this.registrationProvider,
      notificationSettings: notificationSettingsData,
      securitySettings: securitySettingsData,
      preferredColorScheme: this.preferredColorScheme,
      cookieConsent: this.cookieConsent,
      cookiePreferences: this.cookiePreferences,
      subscriptionExpiresAt: this.subscriptionExpiresAt,
    };
  }

  public toPrimitives() {
    const data = this.toPersistence();
    const { password, openAIApiKey, ...primitives } = data;
    return primitives;
  }
}
