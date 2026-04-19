-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('single', 'multiple');

-- CreateEnum
CREATE TYPE "QuizAttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "MediaItem" (
    "id" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'file',
    "mimeType" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "temporary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB,
    "orientation" TEXT,
    "uploadedById" TEXT NOT NULL,
    "updatedById" TEXT,
    "fileStorageProviderId" TEXT NOT NULL,
    "folderId" TEXT,

    CONSTRAINT "MediaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6),
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "subscriptionType" TEXT NOT NULL DEFAULT 'channel',
    "accessType" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "publicationsCount" INTEGER NOT NULL DEFAULT 0,
    "tutorialsCount" INTEGER NOT NULL DEFAULT 0,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "logoId" TEXT,
    "ownerId" TEXT,
    "visibilityId" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "embedding" vector(384),

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelVisibility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "ChannelVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "ChannelRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "textContent" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(6),
    "depth" INTEGER NOT NULL DEFAULT 0,
    "reactionsCount" INTEGER NOT NULL DEFAULT 0,
    "repliesCount" INTEGER NOT NULL DEFAULT 0,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "respondingToId" TEXT,
    "publicationId" TEXT,
    "lessonId" TEXT,
    "authorId" TEXT NOT NULL,
    "qualityScore" JSONB,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "isPermanent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "iconName" TEXT,
    "iconUrl" TEXT,
    "authorisedOnly" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "iconId" TEXT,
    "menuId" TEXT NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "textContent" TEXT NOT NULL,
    "blocksContent" JSONB NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "readingTime" JSONB NOT NULL,
    "hasChanges" BOOLEAN NOT NULL DEFAULT false,
    "lastPublishedDraftVersion" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(6),
    "publishedAt" TIMESTAMP(6),
    "featuredImageUrl" TEXT,
    "featuredImageId" TEXT,
    "authorId" TEXT,
    "statusId" TEXT NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageDraft" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "pageId" TEXT NOT NULL,
    "lastUpdateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "draft" JSONB NOT NULL,

    CONSTRAINT "PageDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "PageStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplyOptions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReplyOptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "slug" TEXT,
    "textContent" TEXT NOT NULL,
    "blocksContent" JSONB NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "canonicalUrl" TEXT,
    "readingTime" JSONB NOT NULL,
    "hasChanges" BOOLEAN NOT NULL DEFAULT false,
    "lastPublishedDraftVersion" INTEGER NOT NULL DEFAULT 0,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(6),
    "publishedAt" TIMESTAMP(6),
    "reactionsCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "readersCount" INTEGER NOT NULL DEFAULT 0,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "discussionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "featuredImageUrl" TEXT,
    "featuredImageId" TEXT,
    "authorId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "replyOptionsId" TEXT,
    "channelId" TEXT,
    "licenseTypeId" TEXT NOT NULL,
    "embedding" vector(384),
    "qualityScore" JSONB,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationDraft" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "publicationId" TEXT NOT NULL,
    "lastUpdateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "draft" JSONB NOT NULL,

    CONSTRAINT "PublicationDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaTag" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'name',
    "name" TEXT,
    "property" TEXT,
    "content" TEXT NOT NULL,
    "channelId" TEXT,
    "pageId" TEXT,
    "publicationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,

    CONSTRAINT "LicenseType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "PublicationStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreadStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "ThreadStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "PublicationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "iconUrl" TEXT NOT NULL,
    "iconId" TEXT,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReactionList" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "actorId" TEXT,
    "reactionId" TEXT,

    CONSTRAINT "ReactionList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reportedUrl" TEXT,
    "reporterIp" TEXT,
    "reporterId" TEXT,
    "reasonId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintInternalNote" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplaintInternalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintReason" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ComplaintReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintStatus" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ComplaintStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "conditions" JSONB,
    "inverted" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentCount" INTEGER NOT NULL DEFAULT 1,
    "blockedUntil" TIMESTAMP(3),
    "expireAt" TIMESTAMP(6) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMediaLink" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "iconUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isConfigured" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SocialMediaLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followerId" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "allowCustomPrice" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "subscriptionType" TEXT NOT NULL DEFAULT 'topic',
    "createdAt" TIMESTAMP(6) NOT NULL,
    "updatedAt" TIMESTAMP(6),
    "publicationsCount" INTEGER NOT NULL DEFAULT 0,
    "tutorialsCount" INTEGER NOT NULL DEFAULT 0,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "logoId" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "tutorialId" TEXT,
    "embedding" vector(384),

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "jobTitle" TEXT,
    "bio" TEXT,
    "registrationProvider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL,
    "updatedAt" TIMESTAMP(6),
    "lastActivityAt" TIMESTAMP(6),
    "notificationsViewedAt" TIMESTAMP(6),
    "avatarUrl" TEXT,
    "openAIApiKey" TEXT,
    "location" TEXT,
    "mediaView" TEXT NOT NULL DEFAULT 'grid',
    "publicationsCount" INTEGER NOT NULL DEFAULT 0,
    "tutorialsCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "isDeactivated" BOOLEAN NOT NULL DEFAULT false,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "hasPaidAccount" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionType" TEXT NOT NULL DEFAULT 'user',
    "birthDate" TIMESTAMP(3),
    "gender" TEXT,
    "avatarId" TEXT,
    "roleId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC+0',
    "isCookiesAccepted" BOOLEAN NOT NULL DEFAULT false,
    "cookieConsent" BOOLEAN NOT NULL DEFAULT false,
    "cookiePreferences" JSONB DEFAULT '{}',
    "preferredColorScheme" TEXT NOT NULL DEFAULT 'light',
    "stripeAccountId" TEXT,
    "stripeAccountStatus" TEXT DEFAULT 'not_started',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionExpiresAt" TIMESTAMP(3),
    "interestVector" vector(384),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceAccess" (
    "id" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "publicationId" TEXT,
    "tutorialId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripeSessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "details" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageDesign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "snapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "resultImageUrl" TEXT,

    CONSTRAINT "ImageDesign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemDashboard" (
    "id" TEXT NOT NULL,
    "layout" JSONB NOT NULL DEFAULT '[]',
    "type" TEXT NOT NULL DEFAULT 'default',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SystemDashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDashboard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "layout" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserDashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonationLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platform" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileStorageProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "accessKeyId" TEXT,
    "secretAccessKey" TEXT,
    "region" TEXT,
    "bucket" TEXT,
    "useAcl" BOOLEAN NOT NULL DEFAULT false,
    "isConfigured" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "cdnEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FileStorageProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailChange" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "newEmail" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecuritySettings" (
    "id" TEXT NOT NULL,
    "mfaConfigured" BOOLEAN NOT NULL DEFAULT false,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SecuritySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CookieSettings" (
    "id" TEXT NOT NULL,
    "allowFunctionalCookies" BOOLEAN NOT NULL DEFAULT false,
    "allowTargetingCookies" BOOLEAN NOT NULL DEFAULT false,
    "allowPerformanceCookies" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CookieSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL,
    "enableWeeklyNewsletterEmails" BOOLEAN NOT NULL DEFAULT false,
    "enablePeriodicDigestOfTopPostsFromMyTopics" BOOLEAN NOT NULL DEFAULT false,
    "enableEmailWhenSomeoneRepliesToMeInCommentThread" BOOLEAN NOT NULL DEFAULT false,
    "enableEmailWhenSomeoneNewFollowsMe" BOOLEAN NOT NULL DEFAULT false,
    "enableEmailWhenSomeoneMentionsMe" BOOLEAN NOT NULL DEFAULT false,
    "enableEmailWhenIReceiveBadge" BOOLEAN NOT NULL DEFAULT false,
    "enablePushNotificationWhenSomeoneRepliesToMeInCommentThread" BOOLEAN NOT NULL DEFAULT false,
    "enablePushNotificationWhenSomeoneMentionsMe" BOOLEAN NOT NULL DEFAULT false,
    "notificationsWhenSomeoneReactsToMyContent" BOOLEAN NOT NULL DEFAULT true,
    "muteAllNotifications" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardWidgetDef" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "settings" JSONB,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DashboardWidgetDef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayoutWidgetDef" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LayoutWidgetDef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isConfigured" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,

    CONSTRAINT "MailProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "isConfigured" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "iconUrl" TEXT,
    "mediaItemId" TEXT,

    CONSTRAINT "OAuthProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOAuthLoginProvider" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "profileId" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserOAuthLoginProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentVisit" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "geo" JSONB,
    "os" JSONB,
    "client" JSONB,
    "loggedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "condeSentCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "codeSentLastTimeAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUntil" TIMESTAMP(3),

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdsProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "config" JSONB,
    "isConfigured" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AdsProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "config" JSONB,
    "isConfigured" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AnalyticsProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaptchaProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "isConfigured" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "siteKey" TEXT,
    "secretKey" TEXT,

    CONSTRAINT "CaptchaProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Layout" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Layout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayoutSlot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "layoutId" TEXT NOT NULL,

    CONSTRAINT "LayoutSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayoutWidget" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "layoutSlotId" TEXT NOT NULL,

    CONSTRAINT "LayoutWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "relatedEntityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaStar" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mediaItemId" TEXT NOT NULL,

    CONSTRAINT "MediaStar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tutorial" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "featuredImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "slug" TEXT,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "rootId" TEXT,
    "reactionsCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "readersCount" INTEGER NOT NULL DEFAULT 0,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "discussionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sectionsCount" INTEGER NOT NULL DEFAULT 0,
    "lessonsCount" INTEGER NOT NULL DEFAULT 0,
    "quizesCount" INTEGER NOT NULL DEFAULT 0,
    "learningDuration" INTEGER NOT NULL DEFAULT 0,
    "estimatedTime" JSONB NOT NULL DEFAULT '{"minutes":0,"words":0,"text":"less than a minute"}',
    "whatYouWillLearn" JSONB NOT NULL DEFAULT '[]',
    "hasChanges" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "channelId" TEXT,
    "statusId" TEXT NOT NULL,
    "licenseTypeId" TEXT NOT NULL,
    "replyOptionsId" TEXT,
    "embedding" vector(384),

    CONSTRAINT "Tutorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "stableKey" TEXT NOT NULL,
    "lessonsCount" INTEGER NOT NULL DEFAULT 0,
    "learningDuration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tutorialId" TEXT NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionItem" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isFreePreview" BOOLEAN NOT NULL DEFAULT true,
    "stableKey" TEXT NOT NULL,
    "lessonId" TEXT,
    "quizId" TEXT,
    "sectionId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,

    CONSTRAINT "SectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "textContent" TEXT NOT NULL,
    "blocksContent" JSONB NOT NULL,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "learningDuration" INTEGER NOT NULL DEFAULT 0,
    "reactionsCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "readingTime" JSONB NOT NULL,
    "featuredImageUrl" TEXT,
    "featuredImageId" TEXT,
    "tutorialId" TEXT,
    "hasChanges" BOOLEAN NOT NULL DEFAULT false,
    "lastPublishedDraftVersion" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonDraft" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "lessonId" TEXT NOT NULL,
    "lastUpdateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "draft" JSONB NOT NULL,

    CONSTRAINT "LessonDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "passingScore" INTEGER NOT NULL DEFAULT 75,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tutorialId" TEXT,
    "hasChanges" BOOLEAN NOT NULL DEFAULT false,
    "lastPublishedDraftVersion" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizDraft" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "quizId" TEXT NOT NULL,
    "lastUpdateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "draft" JSONB NOT NULL,

    CONSTRAINT "QuizDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "type" "QuestionType" NOT NULL DEFAULT 'single',
    "explanation" JSONB NOT NULL DEFAULT '[]',
    "imageUrl" TEXT,
    "imageId" TEXT,
    "quizId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerOption" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "AnswerOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "status" "QuizAttemptStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAnswer" (
    "id" TEXT NOT NULL,
    "quizAttemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT NOT NULL,
    "wasCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "UserAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorialStatus" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TutorialStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(6),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(6),
    "revokedAt" TIMESTAMP(6),
    "metadata" JSONB,

    CONSTRAINT "LoginSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "textContent" TEXT NOT NULL,
    "htmlContent" TEXT,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduleAt" TIMESTAMP(3),
    "reactionsCount" INTEGER NOT NULL DEFAULT 0,
    "repliesCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "respondingToId" TEXT,
    "mainThreadId" TEXT,
    "statusId" TEXT NOT NULL,
    "location" JSONB,
    "replyOptionsId" TEXT,
    "embedding" vector(384),
    "qualityScore" JSONB,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreadPoll" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ThreadPoll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreadPollOption" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,

    CONSTRAINT "ThreadPollOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreadPollVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThreadPollVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feed" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedItem" (
    "id" TEXT NOT NULL,
    "feedId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "target" JSONB,
    "channelId" TEXT,

    CONSTRAINT "FeedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsorType" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SponsorType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sponsorTypeId" TEXT NOT NULL,
    "logoId" TEXT,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedItemTopic" (
    "feedItemId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "FeedItemTopic_pkey" PRIMARY KEY ("feedItemId","topicId")
);

-- CreateTable
CREATE TABLE "AnnouncementType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "AnnouncementType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnouncementStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "AnnouncementStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "dismissable" BOOLEAN NOT NULL DEFAULT true,
    "requireManualDismiss" BOOLEAN NOT NULL DEFAULT false,
    "targetUrl" TEXT,
    "actionText" TEXT,
    "startAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endAt" TIMESTAMP(6),
    "statusId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnouncementRead" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT,
    "ip" TEXT,
    "readAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnouncementDismissal" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT,
    "ip" TEXT,
    "dismissedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementDismissal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MediaItemToThread" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MediaItemToThread_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ChannelModerators" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChannelModerators_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PublicationToTopic" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PublicationToTopic_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ComplaintToMediaItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ComplaintToMediaItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ImageDesignToMediaItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ImageDesignToMediaItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ThreadToTopic" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ThreadToTopic_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_targetId_targetType_userId_key" ON "Bookmark"("targetId", "targetType", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_slug_key" ON "Channel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelVisibility_type_key" ON "ChannelVisibility"("type");

-- CreateIndex
CREATE INDEX "Comment_qualityScore_idx" ON "Comment"("qualityScore");

-- CreateIndex
CREATE UNIQUE INDEX "Page_hash_key" ON "Page"("hash");

-- CreateIndex
CREATE INDEX "PageDraft_pageId_idx" ON "PageDraft"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "PageStatus_type_key" ON "PageStatus"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ReplyOptions_type_key" ON "ReplyOptions"("type");

-- CreateIndex
CREATE INDEX "Publication_qualityScore_idx" ON "Publication"("qualityScore");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_hash_key" ON "Publication"("hash");

-- CreateIndex
CREATE INDEX "PublicationDraft_publicationId_idx" ON "PublicationDraft"("publicationId");

-- CreateIndex
CREATE INDEX "MetaTag_channelId_idx" ON "MetaTag"("channelId");

-- CreateIndex
CREATE INDEX "MetaTag_pageId_idx" ON "MetaTag"("pageId");

-- CreateIndex
CREATE INDEX "MetaTag_publicationId_idx" ON "MetaTag"("publicationId");

-- CreateIndex
CREATE INDEX "LicenseType_parentId_idx" ON "LicenseType"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "PublicationStatus_type_key" ON "PublicationStatus"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ThreadStatus_type_key" ON "ThreadStatus"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PublicationType_type_key" ON "PublicationType"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ReactionList_targetType_targetId_actorId_reactionId_key" ON "ReactionList"("targetType", "targetId", "actorId", "reactionId");

-- CreateIndex
CREATE INDEX "Complaint_targetType_targetId_idx" ON "Complaint"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Complaint_reporterIp_targetType_targetId_idx" ON "Complaint"("reporterIp", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "Complaint_reasonId_idx" ON "Complaint"("reasonId");

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_reporterId_targetType_targetId_key" ON "Complaint"("reporterId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "ComplaintInternalNote_complaintId_idx" ON "ComplaintInternalNote"("complaintId");

-- CreateIndex
CREATE UNIQUE INDEX "ComplaintReason_code_key" ON "ComplaintReason"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ComplaintStatus_code_key" ON "ComplaintStatus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Role_type_key" ON "Role"("type");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_hash_key" ON "EmailVerification"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_userId_key" ON "EmailVerification"("userId");

-- CreateIndex
CREATE INDEX "EmailVerification_expireAt_idx" ON "EmailVerification"("expireAt");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_name_key" ON "Setting"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMediaLink_type_key" ON "SocialMediaLink"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_followerId_targetId_targetType_key" ON "Subscription"("followerId", "targetId", "targetType");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_avatarId_key" ON "User"("avatarId");

-- CreateIndex
CREATE INDEX "ResourceAccess_subjectId_idx" ON "ResourceAccess"("subjectId");

-- CreateIndex
CREATE INDEX "ResourceAccess_resourceType_resourceId_idx" ON "ResourceAccess"("resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceAccess_subjectType_subjectId_resourceType_resourceI_key" ON "ResourceAccess"("subjectType", "subjectId", "resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripeSessionId_key" ON "Purchase"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Purchase_userId_idx" ON "Purchase"("userId");

-- CreateIndex
CREATE INDEX "Purchase_publicationId_idx" ON "Purchase"("publicationId");

-- CreateIndex
CREATE INDEX "Purchase_tutorialId_idx" ON "Purchase"("tutorialId");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");

-- CreateIndex
CREATE INDEX "ImageDesign_userId_idx" ON "ImageDesign"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDashboard_userId_key" ON "UserDashboard"("userId");

-- CreateIndex
CREATE INDEX "DonationLink_userId_idx" ON "DonationLink"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DonationLink_userId_position_key" ON "DonationLink"("userId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "FileStorageProvider_type_key" ON "FileStorageProvider"("type");

-- CreateIndex
CREATE UNIQUE INDEX "EmailChange_userId_key" ON "EmailChange"("userId");

-- CreateIndex
CREATE INDEX "EmailChange_expiresAt_idx" ON "EmailChange"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SecuritySettings_userId_key" ON "SecuritySettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CookieSettings_userId_key" ON "CookieSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON "NotificationSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardWidgetDef_type_key" ON "DashboardWidgetDef"("type");

-- CreateIndex
CREATE UNIQUE INDEX "LayoutWidgetDef_type_key" ON "LayoutWidgetDef"("type");

-- CreateIndex
CREATE UNIQUE INDEX "MailProvider_type_key" ON "MailProvider"("type");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthProvider_type_key" ON "OAuthProvider"("type");

-- CreateIndex
CREATE UNIQUE INDEX "UserOAuthLoginProvider_type_userId_key" ON "UserOAuthLoginProvider"("type", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "RecentVisit_targetType_targetId_userId_key" ON "RecentVisit"("targetType", "targetId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_hash_key" ON "PasswordReset"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_userId_key" ON "PasswordReset"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdsProvider_type_key" ON "AdsProvider"("type");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsProvider_type_key" ON "AnalyticsProvider"("type");

-- CreateIndex
CREATE UNIQUE INDEX "CaptchaProvider_type_key" ON "CaptchaProvider"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Layout_type_key" ON "Layout"("type");

-- CreateIndex
CREATE UNIQUE INDEX "LayoutSlot_type_key" ON "LayoutSlot"("type");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_notification_aggregation_lookup" ON "Notification"("userId", "type", "relatedEntityId", "isRead", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "Activity_actorId_idx" ON "Activity"("actorId");

-- CreateIndex
CREATE INDEX "Activity_targetType_targetId_idx" ON "Activity"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Activity_action_idx" ON "Activity"("action");

-- CreateIndex
CREATE UNIQUE INDEX "Tutorial_slug_key" ON "Tutorial"("slug");

-- CreateIndex
CREATE INDEX "Tutorial_rootId_idx" ON "Tutorial"("rootId");

-- CreateIndex
CREATE INDEX "Tutorial_statusId_idx" ON "Tutorial"("statusId");

-- CreateIndex
CREATE UNIQUE INDEX "Tutorial_rootId_revision_key" ON "Tutorial"("rootId", "revision");

-- CreateIndex
CREATE UNIQUE INDEX "Section_tutorialId_stableKey_key" ON "Section"("tutorialId", "stableKey");

-- CreateIndex
CREATE UNIQUE INDEX "SectionItem_lessonId_key" ON "SectionItem"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "SectionItem_quizId_key" ON "SectionItem"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "SectionItem_sectionId_stableKey_key" ON "SectionItem"("sectionId", "stableKey");

-- CreateIndex
CREATE INDEX "Lesson_tutorialId_idx" ON "Lesson"("tutorialId");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_tutorialId_slug_key" ON "Lesson"("tutorialId", "slug");

-- CreateIndex
CREATE INDEX "LessonDraft_lessonId_idx" ON "LessonDraft"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userId_lessonId_key" ON "LessonProgress"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "Quiz_tutorialId_idx" ON "Quiz"("tutorialId");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_tutorialId_slug_key" ON "Quiz"("tutorialId", "slug");

-- CreateIndex
CREATE INDEX "QuizDraft_quizId_idx" ON "QuizDraft"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAnswer_quizAttemptId_questionId_key" ON "UserAnswer"("quizAttemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "TutorialStatus_type_key" ON "TutorialStatus"("type");

-- CreateIndex
CREATE INDEX "LoginSession_userId_idx" ON "LoginSession"("userId");

-- CreateIndex
CREATE INDEX "LoginSession_createdAt_idx" ON "LoginSession"("createdAt");

-- CreateIndex
CREATE INDEX "Thread_authorId_idx" ON "Thread"("authorId");

-- CreateIndex
CREATE INDEX "Thread_respondingToId_idx" ON "Thread"("respondingToId");

-- CreateIndex
CREATE INDEX "Thread_mainThreadId_idx" ON "Thread"("mainThreadId");

-- CreateIndex
CREATE INDEX "Thread_createdAt_idx" ON "Thread"("createdAt");

-- CreateIndex
CREATE INDEX "Thread_statusId_idx" ON "Thread"("statusId");

-- CreateIndex
CREATE INDEX "Thread_qualityScore_idx" ON "Thread"("qualityScore");

-- CreateIndex
CREATE UNIQUE INDEX "ThreadPoll_threadId_key" ON "ThreadPoll"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "ThreadPollVote_userId_optionId_key" ON "ThreadPollVote"("userId", "optionId");

-- CreateIndex
CREATE UNIQUE INDEX "Feed_type_key" ON "Feed"("type");

-- CreateIndex
CREATE INDEX "FeedItem_createdAt_idx" ON "FeedItem"("createdAt");

-- CreateIndex
CREATE INDEX "FeedItem_authorId_idx" ON "FeedItem"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "FeedItem_feedId_targetType_targetId_key" ON "FeedItem"("feedId", "targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "SponsorType_type_key" ON "SponsorType"("type");

-- CreateIndex
CREATE INDEX "Sponsor_sponsorTypeId_idx" ON "Sponsor"("sponsorTypeId");

-- CreateIndex
CREATE INDEX "FeedItemTopic_topicId_idx" ON "FeedItemTopic"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementType_type_key" ON "AnnouncementType"("type");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementStatus_type_key" ON "AnnouncementStatus"("type");

-- CreateIndex
CREATE INDEX "AnnouncementRead_userId_idx" ON "AnnouncementRead"("userId");

-- CreateIndex
CREATE INDEX "AnnouncementRead_ip_idx" ON "AnnouncementRead"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementRead_announcementId_userId_key" ON "AnnouncementRead"("announcementId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementRead_announcementId_ip_key" ON "AnnouncementRead"("announcementId", "ip");

-- CreateIndex
CREATE INDEX "AnnouncementDismissal_userId_idx" ON "AnnouncementDismissal"("userId");

-- CreateIndex
CREATE INDEX "AnnouncementDismissal_ip_idx" ON "AnnouncementDismissal"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementDismissal_announcementId_userId_key" ON "AnnouncementDismissal"("announcementId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementDismissal_announcementId_ip_key" ON "AnnouncementDismissal"("announcementId", "ip");

-- CreateIndex
CREATE INDEX "_MediaItemToThread_B_index" ON "_MediaItemToThread"("B");

-- CreateIndex
CREATE INDEX "_ChannelModerators_B_index" ON "_ChannelModerators"("B");

-- CreateIndex
CREATE INDEX "_PublicationToTopic_B_index" ON "_PublicationToTopic"("B");

-- CreateIndex
CREATE INDEX "_ComplaintToMediaItem_B_index" ON "_ComplaintToMediaItem"("B");

-- CreateIndex
CREATE INDEX "_ImageDesignToMediaItem_B_index" ON "_ImageDesignToMediaItem"("B");

-- CreateIndex
CREATE INDEX "_ThreadToTopic_B_index" ON "_ThreadToTopic"("B");

-- AddForeignKey
ALTER TABLE "MediaItem" ADD CONSTRAINT "MediaItem_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MediaItem" ADD CONSTRAINT "MediaItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MediaItem" ADD CONSTRAINT "MediaItem_fileStorageProviderId_fkey" FOREIGN KEY ("fileStorageProviderId") REFERENCES "FileStorageProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaItem" ADD CONSTRAINT "MediaItem_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "MediaItem"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "MediaItem"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_visibilityId_fkey" FOREIGN KEY ("visibilityId") REFERENCES "ChannelVisibility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelRule" ADD CONSTRAINT "ChannelRule_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_respondingToId_fkey" FOREIGN KEY ("respondingToId") REFERENCES "Comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_iconId_fkey" FOREIGN KEY ("iconId") REFERENCES "MediaItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "MediaItem"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "PageStatus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PageDraft" ADD CONSTRAINT "PageDraft_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "PublicationType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "PublicationStatus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "MediaItem"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_licenseTypeId_fkey" FOREIGN KEY ("licenseTypeId") REFERENCES "LicenseType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_replyOptionsId_fkey" FOREIGN KEY ("replyOptionsId") REFERENCES "ReplyOptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PublicationDraft" ADD CONSTRAINT "PublicationDraft_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaTag" ADD CONSTRAINT "MetaTag_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaTag" ADD CONSTRAINT "MetaTag_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaTag" ADD CONSTRAINT "MetaTag_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseType" ADD CONSTRAINT "LicenseType_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "LicenseType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_iconId_fkey" FOREIGN KEY ("iconId") REFERENCES "MediaItem"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ReactionList" ADD CONSTRAINT "ReactionList_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ReactionList" ADD CONSTRAINT "ReactionList_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "Reaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES "ComplaintReason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ComplaintStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintInternalNote" ADD CONSTRAINT "ComplaintInternalNote_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerification" ADD CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "MediaItem"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "MediaItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceAccess" ADD CONSTRAINT "ResourceAccess_userId_fkey" FOREIGN KEY ("subjectId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageDesign" ADD CONSTRAINT "ImageDesign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDashboard" ADD CONSTRAINT "UserDashboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationLink" ADD CONSTRAINT "DonationLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailChange" ADD CONSTRAINT "EmailChange_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecuritySettings" ADD CONSTRAINT "SecuritySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CookieSettings" ADD CONSTRAINT "CookieSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSettings" ADD CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthProvider" ADD CONSTRAINT "OAuthProvider_mediaItemId_fkey" FOREIGN KEY ("mediaItemId") REFERENCES "MediaItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOAuthLoginProvider" ADD CONSTRAINT "UserOAuthLoginProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentVisit" ADD CONSTRAINT "RecentVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginHistory" ADD CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoutSlot" ADD CONSTRAINT "LayoutSlot_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "Layout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoutWidget" ADD CONSTRAINT "LayoutWidget_layoutSlotId_fkey" FOREIGN KEY ("layoutSlotId") REFERENCES "LayoutSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaStar" ADD CONSTRAINT "MediaStar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaStar" ADD CONSTRAINT "MediaStar_mediaItemId_fkey" FOREIGN KEY ("mediaItemId") REFERENCES "MediaItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutorial" ADD CONSTRAINT "Tutorial_rootId_fkey" FOREIGN KEY ("rootId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutorial" ADD CONSTRAINT "Tutorial_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutorial" ADD CONSTRAINT "Tutorial_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutorial" ADD CONSTRAINT "Tutorial_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "TutorialStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutorial" ADD CONSTRAINT "Tutorial_licenseTypeId_fkey" FOREIGN KEY ("licenseTypeId") REFERENCES "LicenseType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutorial" ADD CONSTRAINT "Tutorial_replyOptionsId_fkey" FOREIGN KEY ("replyOptionsId") REFERENCES "ReplyOptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionItem" ADD CONSTRAINT "SectionItem_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionItem" ADD CONSTRAINT "SectionItem_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionItem" ADD CONSTRAINT "SectionItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionItem" ADD CONSTRAINT "SectionItem_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "TutorialStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "MediaItem"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonDraft" ADD CONSTRAINT "LessonDraft_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizDraft" ADD CONSTRAINT "QuizDraft_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "MediaItem"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerOption" ADD CONSTRAINT "AnswerOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "AnswerOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginSession" ADD CONSTRAINT "LoginSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_respondingToId_fkey" FOREIGN KEY ("respondingToId") REFERENCES "Thread"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_mainThreadId_fkey" FOREIGN KEY ("mainThreadId") REFERENCES "Thread"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ThreadStatus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_replyOptionsId_fkey" FOREIGN KEY ("replyOptionsId") REFERENCES "ReplyOptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ThreadPoll" ADD CONSTRAINT "ThreadPoll_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadPollOption" ADD CONSTRAINT "ThreadPollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "ThreadPoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadPollVote" ADD CONSTRAINT "ThreadPollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadPollVote" ADD CONSTRAINT "ThreadPollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "ThreadPollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedItem" ADD CONSTRAINT "FeedItem_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedItem" ADD CONSTRAINT "FeedItem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FeedItem" ADD CONSTRAINT "FeedItem_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_sponsorTypeId_fkey" FOREIGN KEY ("sponsorTypeId") REFERENCES "SponsorType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "MediaItem"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FeedItemTopic" ADD CONSTRAINT "FeedItemTopic_feedItemId_fkey" FOREIGN KEY ("feedItemId") REFERENCES "FeedItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedItemTopic" ADD CONSTRAINT "FeedItemTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "AnnouncementType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "AnnouncementStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementDismissal" ADD CONSTRAINT "AnnouncementDismissal_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementDismissal" ADD CONSTRAINT "AnnouncementDismissal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaItemToThread" ADD CONSTRAINT "_MediaItemToThread_A_fkey" FOREIGN KEY ("A") REFERENCES "MediaItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaItemToThread" ADD CONSTRAINT "_MediaItemToThread_B_fkey" FOREIGN KEY ("B") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelModerators" ADD CONSTRAINT "_ChannelModerators_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelModerators" ADD CONSTRAINT "_ChannelModerators_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PublicationToTopic" ADD CONSTRAINT "_PublicationToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PublicationToTopic" ADD CONSTRAINT "_PublicationToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComplaintToMediaItem" ADD CONSTRAINT "_ComplaintToMediaItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComplaintToMediaItem" ADD CONSTRAINT "_ComplaintToMediaItem_B_fkey" FOREIGN KEY ("B") REFERENCES "MediaItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageDesignToMediaItem" ADD CONSTRAINT "_ImageDesignToMediaItem_A_fkey" FOREIGN KEY ("A") REFERENCES "ImageDesign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageDesignToMediaItem" ADD CONSTRAINT "_ImageDesignToMediaItem_B_fkey" FOREIGN KEY ("B") REFERENCES "MediaItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ThreadToTopic" ADD CONSTRAINT "_ThreadToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ThreadToTopic" ADD CONSTRAINT "_ThreadToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
