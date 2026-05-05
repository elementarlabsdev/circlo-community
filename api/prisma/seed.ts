import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';
import { readingTime } from 'reading-time-estimator';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  I18nService,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import { about } from './pages/about';
import { rules } from './pages/rules';
import { advertisement } from './pages/advertisement';
import { termsOfService } from './pages/terms-of-service';
import { privacyPolicy } from './pages/privacy-policy';
import { circlo } from './pages/circlo';
import { ContentBlocksToTextConverter } from '@/common/application/services/content-blocks-to-text-converter.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get('LOCALE') || 'en',
        loaderOptions: {
          path: join(process.cwd(), 'src/i18n/'),
          watch: false,
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        HeaderResolver,
      ],
      inject: [ConfigService],
    }),
  ],
})
class SeedModule {}

// initialize Prisma Client
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const i18n: any = app.get(I18nService);
  const converter = new ContentBlocksToTextConverter();
  const lang = process.env.LOCALE || 'en';

  const alreadyInstalled =
    (await prisma.setting.findFirst({
      where: {
        name: 'alreadyInstalled',
      },
    })) !== null;

  if (alreadyInstalled) {
    await app.close();
    return;
  }

  const menus = [
    {
      name: i18n.t('common.sidebar.main', { lang }),
      type: 'sidebarMain',
      position: 0,
      isPermanent: true,
      items: {
        createMany: {
          data: [
            {
              name: i18n.t('common.menu.main.home', { lang }),
              url: '/',
              position: 1,
              iconName: 'fluent:home-24-regular',
              authorisedOnly: false,
            },
            {
              name: i18n.t('common.menu.main.channels', { lang }),
              url: '/channels',
              position: 2,
              iconName: 'fluent:number-symbol-24-regular',
              authorisedOnly: false,
            },
            {
              name: i18n.t('common.menu.main.topics', { lang }),
              url: '/topics',
              position: 3,
              iconName: 'fluent:compass-northwest-24-regular',
              authorisedOnly: false,
            },
            {
              name: i18n.t('common.menu.main.subscriptions', { lang }),
              url: '/subscriptions',
              position: 4,
              iconName: 'fluent:people-community-24-regular',
              authorisedOnly: true,
            },
            {
              name: i18n.t('common.menu.main.bookmarks', { lang }),
              url: '/bookmarks',
              position: 5,
              iconName: 'fluent:bookmark-24-regular',
              authorisedOnly: true,
            },
          ],
        },
      },
    },
    {
      name: i18n.t('common.sidebar.footer', { lang }),
      type: 'sidebarFooter',
      position: 1,
      isPermanent: true,
      items: {
        createMany: {
          data: [
            {
              name: i18n.t('common.menu.footer.about', { lang }),
              url: '/page/about',
              position: 0,
              authorisedOnly: false,
            },
            {
              name: i18n.t('common.menu.footer.rules', { lang }),
              url: '/page/rules',
              position: 1,
              authorisedOnly: false,
            },
            {
              name: i18n.t('common.menu.footer.advertisement', { lang }),
              url: '/page/advertisement',
              position: 2,
              authorisedOnly: false,
            },
            {
              name: i18n.t('common.menu.footer.circlo', { lang }),
              url: '/page/circlo',
              position: 3,
              authorisedOnly: false,
            },
          ],
        },
      },
    },
  ];

  for (const menu of menus) {
    await prisma.menu.create({
      data: menu,
      include: {
        items: true,
      },
    });
  }

  // Seed default SystemDashboard layout (used by Admin dashboard)
  const systemDashboardsCount = await prisma.systemDashboard.count();
  if (systemDashboardsCount === 0) {
    const defaultAdminLayout = [
      {
        id: 'gettingStarted',
        x: 0,
        y: 0,
        w: 12,
        h: 10,
        type: 'gettingStarted',
        movable: true,
        deletable: true,
        widget: {
          title: i18n.t('common.admin.dashboard.widgets.publicationCount', {
            lang,
          }),
        },
      },
      // Row 1
      // {
      //   id: 'publicationCount',
      //   x: 0,
      //   y: 10,
      //   w: 4,
      //   h: 3,
      //   wLg: 6,
      //   type: 'publicationCount',
      //   movable: true,
      //   widget: {
      //     title: i18n.t('common.admin.dashboard.widgets.publicationCount', {
      //       lang,
      //     }),
      //   },
      // },
      // {
      //   id: 'reactionCount',
      //   x: 4,
      //   y: 10,
      //   w: 4,
      //   h: 3,
      //   wLg: 6,
      //   type: 'reactionCount',
      //   movable: true,
      //   widget: {
      //     title: i18n.t('common.admin.dashboard.widgets.reactionCount', {
      //       lang,
      //     }),
      //   },
      // },
      // {
      //   id: 'views',
      //   x: 8,
      //   y: 10,
      //   w: 4,
      //   h: 3,
      //   wLg: 6,
      //   type: 'viewCount',
      //   movable: true,
      //   widget: {
      //     title: i18n.t('common.admin.dashboard.widgets.viewCount', { lang }),
      //   },
      // },
      {
        id: 'activity',
        x: 0,
        y: 10,
        w: 4,
        h: 14,
        wLg: 6,
        type: 'activity',
        movable: true,
        widget: {
          title: i18n.t('common.admin.dashboard.widgets.activity', { lang }),
        },
      },
      {
        id: 'latestPublications',
        x: 4,
        y: 10,
        w: 4,
        h: 14,
        wLg: 6,
        type: 'latestPublications',
        movable: true,
        widget: {
          title: i18n.t('common.admin.dashboard.widgets.latestPublications', {
            lang,
          }),
        },
      },
      {
        id: 'latestTutorials',
        x: 8,
        y: 10,
        w: 4,
        h: 14,
        wLg: 6,
        type: 'latestTutorials',
        movable: true,
        widget: {
          title: i18n.t('common.admin.dashboard.widgets.latestTutorials', {
            lang,
          }),
        },
      },
    ];

    await prisma.systemDashboard.create({
      data: {
        layout: defaultAdminLayout as any,
        position: 0,
        type: 'default',
      },
    });
  }

  const complaintReasons = [
    { code: 'rude', name: i18n.t('common.complaintReasons.rude', { lang }) },
    {
      code: 'harassment',
      name: i18n.t('common.complaintReasons.harassment', { lang }),
    },
    {
      code: 'copyright',
      name: i18n.t('common.complaintReasons.copyright', { lang }),
    },
    {
      code: 'inappropriate',
      name: i18n.t('common.complaintReasons.inappropriate', { lang }),
    },
    { code: 'other', name: i18n.t('common.complaintReasons.other', { lang }) },
  ];
  await prisma.complaintReason.createMany({
    data: complaintReasons,
    skipDuplicates: true,
  });

  const complaintStatuses = [
    { code: 'pending', name: 'Pending', position: 1 },
    { code: 'inProgress', name: 'In Progress', position: 2 },
    { code: 'resolved', name: 'Resolved', position: 3 },
    { code: 'rejected', name: 'Rejected', position: 4 },
  ];

  for (const status of complaintStatuses) {
    await prisma.complaintStatus.upsert({
      where: { code: status.code },
      update: { name: status.name, position: status.position },
      create: status,
    });
  }

  // Ensure default pending status exists for foreign key constraints if needed immediately
  const defaultStatus = await prisma.complaintStatus.findUnique({
    where: { code: 'pending' },
  });
  if (!defaultStatus)
    throw new Error('Default complaint status "pending" not found');

  const pageStatuses = [
    {
      name: i18n.t('common.page.status.published', { lang }),
      type: 'published',
    },
    {
      name: i18n.t('common.page.status.draft', { lang }),
      type: 'draft',
    },
    {
      name: i18n.t('common.page.status.archived', { lang }),
      type: 'archived',
    },
  ];

  for (const pageStatus of pageStatuses) {
    await prisma.pageStatus.create({
      data: pageStatus,
    });
  }

  const announcementStatuses = [
    {
      name: i18n.t('common.announcement.status.published', { lang }),
      type: 'published',
    },
    {
      name: i18n.t('common.announcement.status.draft', { lang }),
      type: 'draft',
    },
    {
      name: i18n.t('common.announcement.status.archived', { lang }),
      type: 'archived',
    },
  ];

  for (const announcementStatus of announcementStatuses) {
    await prisma.announcementStatus.create({
      data: announcementStatus,
    });
  }

  const announcementTypes = [
    {
      name: i18n.t('common.announcement.type.info', { lang }),
      type: 'info',
    },
    {
      name: i18n.t('common.announcement.type.warning', { lang }),
      type: 'warning',
    },
    {
      name: i18n.t('common.announcement.type.success', { lang }),
      type: 'success',
    },
    {
      name: i18n.t('common.announcement.type.critical', { lang }),
      type: 'critical',
    },
  ];

  for (const announcementType of announcementTypes) {
    await prisma.announcementType.create({
      data: announcementType,
    });
  }

  const pages = [
    {
      title: i18n.t('common.page.about.title', { lang }),
      slug: 'about',
      metaTitle: i18n.t('common.page.about.title', { lang }),
      metaDescription: '',
      textContent: '',
      blocksContent: about[lang],
      hash: crypto.randomUUID(),
      publishedAt: new Date(),
      readingTime: readingTime(''),
      status: {
        connect: {
          type: 'published',
        },
      },
    },
    {
      title: i18n.t('common.page.circlo.title', { lang }),
      slug: 'circlo',
      metaTitle: i18n.t('common.page.circlo.title', { lang }),
      metaDescription: '',
      textContent: '',
      blocksContent: circlo[lang],
      hash: crypto.randomUUID(),
      publishedAt: new Date(),
      readingTime: readingTime(''),
      status: {
        connect: {
          type: 'published',
        },
      },
    },
    {
      title: i18n.t('common.page.rules.title', { lang }),
      slug: 'rules',
      metaTitle: i18n.t('common.page.rules.title', { lang }),
      metaDescription: '',
      hash: crypto.randomUUID(),
      publishedAt: new Date(),
      textContent: '',
      blocksContent: rules[lang],
      readingTime: readingTime(''),
      status: {
        connect: {
          type: 'published',
        },
      },
    },
    {
      title: i18n.t('common.page.advertisement.title', { lang }),
      slug: 'advertisement',
      metaTitle: i18n.t('common.page.advertisement.title', { lang }),
      metaDescription: '',
      hash: crypto.randomUUID(),
      publishedAt: new Date(),
      textContent: '',
      blocksContent: advertisement[lang],
      readingTime: readingTime(''),
      status: {
        connect: {
          type: 'published',
        },
      },
    },
    {
      title: i18n.t('common.page.terms-of-service.title', { lang }),
      slug: 'terms-of-service',
      metaTitle: i18n.t('common.page.terms-of-service.title', { lang }),
      metaDescription: '',
      hash: crypto.randomUUID(),
      publishedAt: new Date(),
      textContent: '',
      blocksContent: termsOfService[lang],
      readingTime: readingTime(''),
      status: {
        connect: {
          type: 'published',
        },
      },
    },
    {
      title: i18n.t('common.page.privacy-policy.title', { lang }),
      slug: 'privacy-policy',
      metaTitle: i18n.t('common.page.privacy-policy.title', { lang }),
      metaDescription: '',
      hash: crypto.randomUUID(),
      publishedAt: new Date(),
      textContent: '',
      blocksContent: privacyPolicy[lang],
      readingTime: readingTime(''),
      status: {
        connect: {
          type: 'published',
        },
      },
    },
  ];

  for (const pageData of pages) {
    const textContent = converter.convert(pageData.blocksContent as any[]);
    const page = {
      ...pageData,
      textContent,
      readingTime: readingTime(textContent),
    };

    await prisma.page.create({
      data: page,
    });
  }

  const publicationStatuses = [
    {
      name: i18n.t('common.publication.status.published', { lang }),
      type: 'published',
    },
    {
      name: i18n.t('common.publication.status.scheduled', { lang }),
      type: 'scheduled',
    },
    {
      name: i18n.t('common.publication.status.draft', { lang }),
      type: 'draft',
    },
    {
      name: i18n.t('common.publication.status.archived', { lang }),
      type: 'archived',
    },
  ];

  for (const publicationStatus of publicationStatuses) {
    await prisma.publicationStatus.create({
      data: publicationStatus,
    });
  }

  const publicationTypes = [
    {
      name: i18n.t('common.publication.type.article', { lang }),
      type: 'article',
    },
    {
      name: i18n.t('common.publication.type.tutorial', { lang }),
      type: 'tutorial',
    },
  ];

  for (const publicationType of publicationTypes) {
    await prisma.publicationType.create({
      data: publicationType,
    });
  }

  const reactions = [
    {
      name: i18n.t('common.reaction.like', { lang }),
      type: 'like',
      iconUrl: '/assets/reactions/like.svg',
      position: 1,
    },
    {
      name: i18n.t('common.reaction.fire', { lang }),
      type: 'fire',
      iconUrl: '/assets/reactions/fire.svg',
      position: 2,
    },
    {
      name: i18n.t('common.reaction.explodingHead', { lang }),
      type: 'explodingHead',
      iconUrl: '/assets/reactions/exploding-head.svg',
      position: 3,
    },
    {
      name: i18n.t('common.reaction.clap', { lang }),
      type: 'clap',
      iconUrl: '/assets/reactions/clap.svg',
      position: 4,
    },
  ];

  for (const reaction of reactions) {
    await prisma.reaction.create({
      data: reaction,
    });
  }

  const roles = [
    {
      name: i18n.t('common.role.admin', { lang }),
      type: 'admin',
      isBuiltIn: true,
      permissions: {
        create: [{ action: 'manage', subject: 'all' }],
      },
    },
    {
      name: i18n.t('common.role.demo', { lang }),
      type: 'demo',
      isBuiltIn: true,
      permissions: {
        create: [
          { action: 'read', subject: 'AdminPanel' },
          { action: 'read', subject: 'all' },
        ],
      },
    },
    {
      name: i18n.t('common.role.user', { lang }),
      type: 'user',
      isBuiltIn: true,
      permissions: {
        create: [
          {
            action: 'manage',
            subject: 'Publication',
            conditions: { authorId: '${user.id}' },
          },
          {
            action: 'manage',
            subject: 'Tutorial',
            conditions: { authorId: '${user.id}' },
          },
          {
            action: 'manage',
            subject: 'MediaItem',
            conditions: { uploadedById: '${user.id}' },
          },
          {
            action: 'manage',
            subject: 'Comment',
            conditions: { authorId: '${user.id}' },
          },
          {
            action: 'manage',
            subject: 'Reaction',
            conditions: { userId: '${user.id}' },
          },
          {
            action: 'manage',
            subject: 'User',
            conditions: { id: '${user.id}' },
          },
        ],
      },
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { type: role.type },
      update: {
        name: role.name,
        isBuiltIn: role.isBuiltIn,
        permissions: {
          deleteMany: {},
          create: role.permissions.create,
        },
      },
      create: role,
    });
  }

  const settings = [
    {
      name: 'alreadyInstalled',
      category: 'system',
      data: {
        value: true,
      },
    },
    {
      name: 'siteTitle',
      category: 'general',
      data: {
        value: i18n.t('common.site.title', { lang }),
      },
    },
    {
      name: 'siteName',
      category: 'general',
      data: {
        value: i18n.t('common.site.name', { lang }),
      },
    },
    {
      name: 'metaDescription',
      category: 'general',
      data: {
        value: '',
      },
    },
    {
      name: 'metaKeywords',
      category: 'general',
      data: {
        value: [],
      },
    },
    {
      name: 'newUserDefaultRole',
      category: 'general',
      data: {
        value: 'user',
      },
    },
    {
      name: 'socialMediaLinks',
      category: 'general',
      data: {
        value: [],
      },
    },
    {
      name: 'timezone',
      category: 'general',
      data: {
        value: 'UTC+0',
      },
    },
    {
      name: 'weekStartsOn',
      category: 'general',
      data: {
        value: 1,
      },
    },
    {
      name: 'copyright',
      category: 'general',
      data: {
        value: new Date().getFullYear(),
      },
    },
    {
      name: 'contentAllowThreads',
      category: 'content',
      data: {
        value: true,
      },
    },
    {
      name: 'contentAllowPublications',
      category: 'content',
      data: {
        value: true,
      },
    },
    {
      name: 'contentAllowTutorials',
      category: 'content',
      data: {
        value: true,
      },
    },
    {
      name: 'contentAllowCourses',
      category: 'content',
      data: {
        value: true,
      },
    },
    {
      name: 'publicationsPerPage',
      category: 'reading',
      data: {
        value: 20,
      },
    },
    {
      name: 'feedItemsPerPage',
      category: 'reading',
      data: {
        value: 20,
      },
    },
    {
      name: 'feedType',
      category: 'reading',
      data: {
        value: 'standard',
      },
    },
    {
      name: 'studioPublicationsPerPage',
      category: 'reading',
      data: {
        value: 12,
      },
    },
    {
      name: 'studioTutorialsPerPage',
      category: 'reading',
      data: {
        value: 12,
      },
    },
    {
      name: 'topicsPerPage',
      category: 'reading',
      data: {
        value: 32,
      },
    },
    {
      name: 'channelsPerPage',
      category: 'reading',
      data: {
        value: 32,
      },
    },
    {
      name: 'publicationsShowOnFront',
      category: 'reading',
      data: {
        value: 'latest',
      },
    },
    {
      name: 'newDraftVersionCreationInterval',
      category: 'content',
      data: {
        value: 5,
      },
    },
    {
      name: 'maxDraftPublicationsPerUser',
      category: 'content',
      data: {
        value: 5,
      },
    },
    {
      name: 'maxDraftTutorialsPerUser',
      category: 'content',
      data: {
        value: 5,
      },
    },
    {
      name: 'commentsEnabled',
      category: 'discussion',
      data: {
        value: true,
      },
    },
    {
      name: 'closeCommentsForOldPosts',
      category: 'discussion',
      data: {
        value: false,
      },
    },
    {
      name: 'closeCommentsDaysOld',
      category: 'discussion',
      data: {
        value: 30,
      },
    },
    {
      name: 'threadCommentsDepth',
      category: 'discussion',
      data: {
        value: 4,
      },
    },
    {
      name: 'commentsOrder',
      category: 'discussion',
      data: {
        value: 'older',
      },
    },
    {
      name: 'mailFrom',
      category: 'mail',
      data: {
        value: 'Circlo Community',
      },
    },
    {
      name: 'mailDomain',
      category: 'mail',
      data: {
        value: process.env.DOMAIN,
      },
    },
    {
      name: 'systemEmail',
      category: 'mail',
      data: {
        value: `noreply@${process.env.DOMAIN}`,
      },
    },
    {
      name: 'supportEmail',
      category: 'mail',
      data: {
        value: `support@${process.env.DOMAIN}`,
      },
    },
    {
      name: 'maxUploadImageSize',
      category: 'upload',
      data: {
        value: 5, // MB
      },
    },
    {
      name: 'maxUploadVideoSize',
      category: 'upload',
      data: {
        value: 200, // MB
      },
    },
    {
      name: 'cookieConsent',
      category: 'security',
      data: {
        value: {
          bannerTitle: i18n.t('common.cookieConsent.bannerTitle', { lang }),
          messageText: i18n.t('common.cookieConsent.messageText', { lang }),
          acceptLabel: i18n.t('common.cookieConsent.acceptLabel', { lang }),
          declineLabel: i18n.t('common.cookieConsent.declineLabel', { lang }),
          position: 'bottom-full',
          closeOnOverlayClick: false,
          autoCloseTimer: true,
          delay: 10,
          categories: [
            {
              id: 1,
              name: i18n.t(
                'common.cookieConsent.category.strictlyNecessary.name',
                {
                  lang,
                },
              ),
              shortDescription: i18n.t(
                'common.cookieConsent.category.strictlyNecessary.shortDescription',
                { lang },
              ),
              detailedDescription: i18n.t(
                'common.cookieConsent.category.strictlyNecessary.detailedDescription',
                { lang },
              ),
              isMandatory: true,
              isExpanded: false,
            },
            {
              id: 2,
              name: i18n.t('common.cookieConsent.category.functional.name', {
                lang,
              }),
              shortDescription: i18n.t(
                'common.cookieConsent.category.functional.shortDescription',
                { lang },
              ),
              detailedDescription: i18n.t(
                'common.cookieConsent.category.functional.detailedDescription',
                { lang },
              ),
              isMandatory: false,
              isExpanded: false,
            },
            {
              id: 3,
              name: i18n.t('common.cookieConsent.category.targeting.name', {
                lang,
              }),
              shortDescription: i18n.t(
                'common.cookieConsent.category.targeting.shortDescription',
                { lang },
              ),
              detailedDescription: i18n.t(
                'common.cookieConsent.category.targeting.detailedDescription',
                { lang },
              ),
              isMandatory: false,
              isExpanded: false,
            },
            {
              id: 4,
              name: i18n.t('common.cookieConsent.category.performance.name', {
                lang,
              }),
              shortDescription: i18n.t(
                'common.cookieConsent.category.performance.shortDescription',
                { lang },
              ),
              detailedDescription: i18n.t(
                'common.cookieConsent.category.performance.detailedDescription',
                { lang },
              ),
              isMandatory: false,
              isExpanded: false,
            },
          ],
        },
      },
    },
    {
      name: 'emptyUserDeletionPeriod',
      category: 'security',
      data: {
        value: 365, // in days
      },
    },
    {
      name: 'siteLogoUrl',
      category: 'branding',
      data: {
        value: '',
      },
    },
    {
      name: 'siteIconUrl',
      category: 'branding',
      data: {
        value: '',
      },
    },
    {
      name: 'fontFamily',
      category: 'branding',
      data: {
        value: 'Open Sans',
      },
    },
    {
      name: 'styles',
      category: 'branding',
      data: {
        value: '',
      },
    },
    {
      name: 'isPublicCommunity',
      category: 'identity',
      data: {
        value: true,
      },
    },
    {
      name: 'registrationEnabled',
      category: 'identity',
      data: {
        value: false,
      },
    },
    {
      name: 'oAuthEnabled',
      category: 'identity',
      data: {
        value: false,
      },
    },
    {
      name: 'emailVerificationIntervalBetweenSendsTime',
      category: 'security',
      data: {
        value: 10, // minutes
      },
    },
    {
      name: 'emailVerificationSentCount',
      category: 'security',
      data: {
        value: 5,
      },
    },
    {
      name: 'emailVerificationBlockTime',
      category: 'security',
      data: {
        value: 360, // minutes
      },
    },
    {
      name: 'stripeConfigured',
      category: 'stripe',
      data: {
        value: false,
      },
    },
    {
      name: 'stripePublishableKey',
      category: 'stripe',
      data: {
        value: '',
      },
    },
    {
      name: 'stripeSecretKey',
      category: 'stripe',
      data: {
        value: '',
      },
    },
    {
      name: 'stripeWebhookSecret',
      category: 'stripe',
      data: {
        value: '',
      },
    },
    {
      name: 'stripeApplicationFeeAmount',
      category: 'stripe',
      data: {
        value: 20,
      },
    },
    {
      name: 'stripeCurrency',
      category: 'stripe',
      data: {
        value: 'USD',
      },
    },
    {
      name: 'monetizationPaidAccountEnabled',
      category: 'monetization',
      data: {
        value: false,
      },
    },
    {
      name: 'monetizationPaidAccountPrice',
      category: 'monetization',
      data: {
        value: 0,
      },
    },
    {
      name: 'monetizationPaidAccountFeatures',
      category: 'monetization',
      data: {
        value: [],
      },
    },
    {
      name: 'monetizationCreditsEnabled',
      category: 'monetization',
      data: {
        value: false,
      },
    },
    {
      name: 'robotsTxtContent',
      category: 'search-engine-crawlers',
      data: {
        value: `User-agent: *
Disallow: /search?q=*
Disallow: /search/?q=*
Disallow: /admin/*
Disallow: /studio/*

Sitemap: ${process.env.FRONTEND_URL}/sitemap-index.xml`,
      },
    },
    {
      name: 'licenseKey',
      category: 'license',
      data: {
        value: '',
      },
    },
    {
      name: 'licenseConfigured',
      category: 'license',
      data: {
        value: false,
      },
    },
  ];

  for (const setting of settings) {
    await prisma.setting.create({
      data: setting,
    });
  }

  const socialMediaLinks = [
    {
      name: i18n.t('common.socialMedia.facebook', { lang }),
      type: 'facebook',
      iconUrl: 'assets/social-media/facebook.svg',
      position: 0,
    },
    {
      name: i18n.t('common.socialMedia.x', { lang }),
      type: 'x',
      iconUrl: 'assets/social-media/x.svg',
      position: 1,
    },
    {
      name: i18n.t('common.socialMedia.telegram', { lang }),
      type: 'telegram',
      iconUrl: 'assets/social-media/telegram.svg',
      position: 2,
    },
    {
      name: i18n.t('common.socialMedia.linkedIn', { lang }),
      type: 'linkedIn',
      iconUrl: 'assets/social-media/linkedin.svg',
      position: 3,
    },
    {
      name: i18n.t('common.socialMedia.github', { lang }),
      type: 'github',
      iconUrl: 'assets/social-media/github.svg',
      position: 4,
    },
    {
      name: i18n.t('common.socialMedia.instagram', { lang }),
      type: 'instagram',
      iconUrl: 'assets/social-media/instagram.svg',
      position: 5,
    },
    {
      name: i18n.t('common.socialMedia.threads', { lang }),
      type: 'threads',
      iconUrl: 'assets/social-media/threads.svg',
      position: 6,
    },
    {
      name: i18n.t('common.socialMedia.tiktok', { lang }),
      type: 'tiktok',
      iconUrl: 'assets/social-media/tiktok.svg',
      position: 7,
    },
    {
      name: i18n.t('common.socialMedia.youtube', { lang }),
      type: 'youtube',
      iconUrl: 'assets/social-media/youtube.svg',
      position: 10,
    },
  ];

  for (const socialMediaLink of socialMediaLinks) {
    await prisma.socialMediaLink.create({
      data: socialMediaLink,
    });
  }

  const fileStorageProviders = [
    {
      name: i18n.t('common.fileStorage.local', { lang }),
      type: 'local',
      description: 'fileStorageProvider.local.description',
      position: 0,
      isConfigured: true,
      isEnabled: true,
      isDefault: true,
      useAcl: true,
    },
    {
      name: i18n.t('common.fileStorage.hetzner', { lang }),
      type: 'hetzner',
      description: 'fileStorageProvider.hetzner.description',
      position: 1,
      accessKeyId: '',
      secretAccessKey: '',
      region: '',
      bucket: '',
      useAcl: true,
    },
    {
      name: i18n.t('common.fileStorage.digitalocean', { lang }),
      type: 'digitalocean',
      description: 'fileStorageProvider.digitalocean.description',
      position: 2,
      accessKeyId: '',
      secretAccessKey: '',
      region: '',
      bucket: '',
      cdnEnabled: false,
      useAcl: true,
    },
    {
      name: i18n.t('common.fileStorage.s3', { lang }),
      type: 'aws-s3',
      description: 'fileStorageProvider.s3.description',
      position: 3,
      accessKeyId: '',
      secretAccessKey: '',
      region: '',
      bucket: '',
      useAcl: false,
    },
  ];

  for (const fileStorageProvider of fileStorageProviders) {
    await prisma.fileStorageProvider.create({
      data: fileStorageProvider,
    });
  }

  const mailProviders = [
    {
      name: i18n.t('common.mailProvider.none.name', { lang }),
      type: 'none',
      description: 'mailProvider.none.description',
      isConfigured: true,
      isEnabled: true,
      isDefault: true,
      position: 0,
      config: null,
    },
    {
      name: i18n.t('common.mailProvider.aws-ses.name', { lang }),
      type: 'aws-ses',
      description: 'mailProvider.aws-ses.description',
      isConfigured: false,
      isEnabled: false,
      isDefault: false,
      position: 1,
      config: {
        region: '',
        accessKeyId: '',
        secretAccessKey: '',
      },
    },
    {
      name: i18n.t('common.mailProvider.resend.name', { lang }),
      type: 'resend',
      description: 'mailProvider.resend.description',
      isConfigured: false,
      isEnabled: false,
      isDefault: false,
      position: 2,
      config: {
        apiKey: '',
      },
    },
    {
      name: i18n.t('common.mailProvider.sendgrid.name', { lang }),
      type: 'sendgrid',
      description: 'mailProvider.sendgrid.description',
      isConfigured: false,
      isEnabled: false,
      isDefault: false,
      position: 4,
      config: {
        apiKey: '',
      },
    },
  ];

  for (const mailProvider of mailProviders) {
    await prisma.mailProvider.create({
      data: mailProvider,
    });
  }

  // Sponsor types
  const sponsorTypes = [
    {
      name: i18n.t('common.sponsor.bronze', { lang }),
      type: 'bronze',
      position: 0,
    },
    {
      name: i18n.t('common.sponsor.silver', { lang }),
      type: 'silver',
      position: 1,
    },
    {
      name: i18n.t('common.sponsor.gold', { lang }),
      type: 'gold',
      position: 2,
    },
    {
      name: i18n.t('common.sponsor.platinum', { lang }),
      type: 'platinum',
      position: 3,
    },
  ];

  for (const sponsorType of sponsorTypes) {
    await prisma.sponsorType.create({
      data: sponsorType,
    });
  }

  const oAuthProviders = [
    {
      name: i18n.t('common.oAuthProvider.github.name', { lang }),
      type: 'github',
      description: 'oAuthProviders.github.description',
      position: 0,
      config: {
        clientId: '',
        clientSecret: '',
        scope: [],
      },
      iconUrl: 'assets/auth/github-logo.svg',
    },
    {
      name: i18n.t('common.oAuthProvider.google.name', { lang }),
      type: 'google',
      description: 'oAuthProviders.google.description',
      position: 1,
      config: {
        clientId: '',
        clientSecret: '',
        scope: [],
      },
      iconUrl: 'assets/auth/google-logo.svg',
    },
    {
      name: i18n.t('common.oAuthProvider.facebook.name', { lang }),
      type: 'facebook',
      description: 'oAuthProviders.facebook.description',
      position: 3,
      config: {
        clientId: '',
        clientSecret: '',
        scope: [],
      },
      iconUrl: 'assets/auth/facebook-logo.svg',
    },
    {
      name: i18n.t('common.oAuthProvider.x.name', { lang }),
      type: 'x',
      description: 'oAuthProviders.x.description',
      position: 6,
      config: {
        clientId: '',
        clientSecret: '',
        scope: [],
      },
      iconUrl: 'assets/auth/x-logo.svg',
    },
  ];

  for (const oAuthProvider of oAuthProviders) {
    await prisma.oAuthProvider.create({
      data: oAuthProvider,
    });
  }

  const channelVisibilities = [
    {
      name: i18n.t('common.channel.visibility.public.title', { lang }),
      type: 'public',
      description: 'channel.visibility.public.description',
    },
    {
      name: i18n.t('common.channel.visibility.private.title', { lang }),
      type: 'private',
      description: 'channel.visibility.private.description',
    },
  ];

  for (const channelVisibility of channelVisibilities) {
    await prisma.channelVisibility.create({
      data: channelVisibility,
    });
  }

  const adsProviders = [
    {
      name: i18n.t('common.adsProvider.googleAdsense.name', { lang }),
      type: 'googleAdsense',
      logoUrl: '',
      description: 'adsProvider.googleAdsense.description',
      position: 0,
    },
  ];

  for (const adsProvider of adsProviders) {
    await prisma.adsProvider.create({
      data: adsProvider,
    });
  }

  const analyticsProviders = [
    {
      name: i18n.t('common.analyticsProvider.googleAnalytics.name', { lang }),
      type: 'googleAnalytics',
      logoUrl: '',
      description: 'analyticsProvider.googleAnalytics.description',
      position: 0,
    },
  ];

  for (const analyticsProvider of analyticsProviders) {
    await prisma.analyticsProvider.create({
      data: analyticsProvider,
    });
  }

  const captchaProviders = [
    {
      name: i18n.t('common.captchaProvider.local.name', { lang }),
      type: 'local',
      description: 'captchaProvider.local.description',
      position: 0,
      isConfigured: false,
      isDefault: false,
      siteKey: '',
      secretKey: '',
    },
    {
      name: i18n.t('common.captchaProvider.recaptcha.name', { lang }),
      type: 'recaptcha',
      description: 'captchaProvider.recaptcha.description',
      position: 1,
      isConfigured: false,
      isDefault: false,
      siteKey: '',
      secretKey: '',
    },
  ];

  for (const captchaProvider of captchaProviders) {
    await prisma.captchaProvider.create({
      data: captchaProvider,
    });
  }

  const layoutWidgetDefs = [
    {
      name: i18n.t('common.pageWidgets.recommendedTopics.title', { lang }),
      description: i18n.t('common.pageWidgets.recommendedTopics.description', {
        lang,
      }),
      type: 'recommendedTopics',
      position: 0,
      settings: {
        limit: 5,
      },
    },
    {
      name: i18n.t('common.pageWidgets.recommendedChannels.title', { lang }),
      description: i18n.t(
        'common.pageWidgets.recommendedChannels.description',
        {
          lang,
        },
      ),
      type: 'recommendedChannels',
      position: 1,
      settings: {
        limit: 3,
      },
    },
    {
      name: i18n.t('common.pageWidgets.communityInfo.title', { lang }),
      description: i18n.t('common.pageWidgets.communityInfo.description', {
        lang,
      }),
      type: 'communityInfo',
      position: 2,
      settings: {
        content: '',
      },
    },
    {
      name: i18n.t('common.pageWidgets.discussions.title', { lang }),
      description: i18n.t('common.pageWidgets.discussions.description', {
        lang,
      }),
      type: 'discussions',
      position: 3,
      settings: {
        limit: 8,
      },
    },
    {
      name: i18n.t('common.pageWidgets.events.title', { lang }),
      description: i18n.t('common.pageWidgets.events.description', { lang }),
      type: 'events',
      position: 4,
      settings: {
        limit: 4,
      },
    },
    {
      name: i18n.t('common.pageWidgets.socialMediaLinks.title', { lang }),
      description: i18n.t('common.pageWidgets.socialMediaLinks.description', {
        lang,
      }),
      type: 'socialMediaLinks',
      position: 5,
      settings: {},
    },
  ];

  for (const layoutWidgetDef of layoutWidgetDefs) {
    await prisma.layoutWidgetDef.create({
      data: layoutWidgetDef,
    });
  }

  const layouts = [
    {
      name: i18n.t('common.layout.home.name', { lang }),
      type: 'home',
      position: 0,
      layoutSlots: {
        createMany: {
          data: [
            {
              name: i18n.t('common.layout.slot.homeSidebarBeforeMainMenu', {
                lang,
              }),
              type: 'homeSidebarBeforeMainMenu',
              position: 0,
            },
            {
              name: i18n.t('common.layout.slot.homeSidebarAfterMainMenu', {
                lang,
              }),
              type: 'homeSidebarAfterMainMenu',
              position: 1,
            },
            {
              name: i18n.t('common.layout.slot.homeSidebarBeforeFooterMenu', {
                lang,
              }),
              type: 'homeSidebarBeforeFooterMenu',
              position: 2,
            },
            {
              name: i18n.t('common.layout.slot.homeSidebarAfterFooterMenu', {
                lang,
              }),
              type: 'homeSidebarAfterFooterMenu',
              position: 3,
            },
            {
              name: i18n.t('common.layout.slot.homeBeforeMainContent', {
                lang,
              }),
              type: 'homeBeforeMainContent',
              position: 4,
            },
            {
              name: i18n.t('common.layout.slot.homeAfterMainContent', { lang }),
              type: 'homeAfterMainContent',
              position: 5,
            },
            {
              name: i18n.t('common.layout.slot.homeAside', { lang }),
              type: 'homeAside',
              position: 6,
            },
          ],
        },
      },
    },
    {
      name: i18n.t('common.layout.publication.name', { lang }),
      type: 'publication',
      position: 0,
      layoutSlots: {
        createMany: {
          data: [
            {
              name: i18n.t('common.layout.slot.beforePublication', { lang }),
              type: 'publicationBefore',
              position: 0,
            },
            {
              name: i18n.t('common.layout.slot.afterPublication', { lang }),
              type: 'publicationAfter',
              position: 1,
            },
            {
              name: i18n.t('common.layout.slot.beforeComments', { lang }),
              type: 'publicationBeforeComments',
              position: 2,
            },
            {
              name: i18n.t('common.layout.slot.publicationAside', { lang }),
              type: 'publicationAside',
              position: 3,
            },
          ],
        },
      },
    },
    {
      name: i18n.t('common.layout.tutorial.name', { lang }),
      type: 'tutorial',
      position: 0,
      layoutSlots: {
        createMany: {
          data: [
            {
              name: i18n.t('common.layout.slot.beforeLesson', { lang }),
              type: 'lessonBefore',
              position: 0,
            },
            {
              name: i18n.t('common.layout.slot.afterLesson', { lang }),
              type: 'lessonAfter',
              position: 1,
            },
            {
              name: i18n.t('common.layout.slot.lessonBeforeComments', { lang }),
              type: 'lessonBeforeComments',
              position: 2,
            },
          ],
        },
      },
    },
  ];

  for (const layout of layouts) {
    await prisma.layout.create({
      data: layout,
    });
  }

  const layoutWidgets = [
    {
      name: i18n.t('common.pageWidgets.socialMediaLinks.title', { lang }),
      type: 'socialMediaLinks',
      position: 0,
      settings: {},
      layoutSlot: {
        connect: {
          type: 'homeSidebarAfterMainMenu',
        },
      },
    },
    {
      name: i18n.t('common.pageWidgets.recommendedTopics.title', { lang }),
      type: 'recommendedTopics',
      position: 0,
      settings: {
        limit: 5,
      },
      layoutSlot: {
        connect: {
          type: 'homeAside',
        },
      },
    },
    {
      name: i18n.t('common.pageWidgets.recommendedChannels.title', { lang }),
      type: 'recommendedChannels',
      position: 1,
      settings: {
        limit: 3,
      },
      layoutSlot: {
        connect: {
          type: 'homeAside',
        },
      },
    },
  ];

  for (const layoutWidget of layoutWidgets) {
    await prisma.layoutWidget.create({
      data: layoutWidget,
    });
  }

  const dashboardWidgetDefs = [
    {
      name: i18n.t('common.dashboardWidgets.publishedPublications.title', {
        lang,
      }),
      description: i18n.t(
        'common.dashboardWidgets.publishedPublications.description',
        {
          lang,
        },
      ),
      type: 'publishedPublications',
      position: 0,
    },
  ];

  for (const dashboardWidgetDef of dashboardWidgetDefs) {
    await prisma.dashboardWidgetDef.create({
      data: dashboardWidgetDef,
    });
  }

  const licenseTypes = [
    {
      name: i18n.t('common.license.allRightsReserved.name', { lang }),
      position: 0,
      rules: [
        {
          name: i18n.t('common.license.rule.noCopyPermission', { lang }),
          icon: 'assets/license-types/creative-commons-cc.svg',
        },
      ],
      isDefault: true,
    },
    {
      name: i18n.t('common.license.someRightsReserved.name', { lang }),
      rules: [
        {
          name: i18n.t('common.license.rule.attribution', { lang }),
          icon: 'assets/license-types/creative-commons-attribution.svg',
        },
      ],
      children: {
        createMany: {
          data: [
            {
              name: i18n.t('common.license.attribution.name', { lang }),
              rules: [],
              position: 0,
            },
            {
              name: i18n.t('common.license.attributionNoDerivatives.name', {
                lang,
              }),
              position: 1,
              rules: [
                {
                  name: i18n.t('common.license.rule.noDerivatives', { lang }),
                  icon: 'assets/license-types/creative-commons-nd.svg',
                },
              ],
            },
            {
              name: i18n.t('common.license.attributionShareAlike.name', {
                lang,
              }),
              position: 2,
              rules: [
                {
                  name: i18n.t('common.license.rule.shareAlike', { lang }),
                  icon: 'assets/license-types/creative-commons-sharealike.svg',
                },
              ],
            },
            {
              name: i18n.t('common.license.attributionNonCommercial.name', {
                lang,
              }),
              position: 3,
              rules: [
                {
                  name: i18n.t('common.license.rule.nonCommercial', { lang }),
                  icon: 'assets/license-types/creative-commons-nc.svg',
                },
              ],
            },
            {
              name: i18n.t(
                'common.license.attributionNonCommercialNoDerivatives.name',
                { lang },
              ),
              position: 4,
              rules: [
                {
                  name: i18n.t('common.license.rule.nonCommercial', { lang }),
                  icon: 'assets/license-types/creative-commons-nc.svg',
                },
                {
                  name: i18n.t('common.license.rule.noDerivatives', { lang }),
                  icon: 'assets/license-types/creative-commons-sharealike.svg',
                },
              ],
            },
            {
              name: i18n.t(
                'common.license.attributionNonCommercialShareAlike.name',
                { lang },
              ),
              position: 5,
              rules: [
                {
                  name: i18n.t('common.license.rule.nonCommercial', { lang }),
                  icon: 'assets/license-types/creative-commons-zero.svg',
                },
                {
                  name: i18n.t('common.license.rule.shareAlike', { lang }),
                  icon: '',
                },
              ],
            },
          ],
        },
      },
    },
    {
      name: i18n.t('common.license.noRightsReserved.name', { lang }),
      position: 3,
      rules: [],
      children: {
        createMany: {
          data: [
            {
              name: i18n.t(
                'common.license.creativeCommonsCopyrightWaiver.name',
                { lang },
              ),
              position: 0,
              rules: [
                {
                  name: i18n.t('common.license.rule.waiveRights', { lang }),
                  icon: '',
                },
              ],
            },
            {
              name: i18n.t('common.license.publicDomain.name', { lang }),
              position: 1,
              rules: [
                {
                  name: i18n.t('common.license.rule.publicDomain', { lang }),
                  icon: '',
                },
              ],
            },
          ],
        },
      },
    },
  ];

  for (const licenseType of licenseTypes) {
    await prisma.licenseType.create({
      data: licenseType,
    });
  }

  const statuses = [
    { type: 'draft', name: i18n.t('common.status.draft', { lang }) },
    {
      type: 'unpublishedChanges',
      name: i18n.t('common.status.unpublishedChanges', { lang }),
    },
    { type: 'scheduled', name: i18n.t('common.status.scheduled', { lang }) },
    { type: 'published', name: i18n.t('common.status.published', { lang }) },
    { type: 'archived', name: i18n.t('common.status.archived', { lang }) },
  ];

  for (const status of statuses) {
    await prisma.tutorialStatus.create({
      data: status,
    });
  }

  const threadStatuses = [
    { type: 'draft', name: i18n.t('common.status.draft', { lang }) },
    { type: 'published', name: i18n.t('common.status.published', { lang }) },
    { type: 'archived', name: i18n.t('common.status.archived', { lang }) },
  ];

  for (const status of threadStatuses) {
    await prisma.threadStatus.create({
      data: status,
    });
  }

  // Create a default feed
  await prisma.feed.create({
    data: { name: 'Default', type: 'default' },
  });

  const replyOptions = [
    {
      name: i18n.t('common.replyOptions.anyone', { lang }),
      type: 'anyone',
      position: 1,
    },
    {
      name: i18n.t('common.replyOptions.followers', { lang }),
      type: 'followers',
      position: 2,
    },
    {
      name: i18n.t('common.replyOptions.mentioned', { lang }),
      type: 'mentioned',
      position: 3,
    },
    {
      name: i18n.t('common.replyOptions.nobody', { lang }),
      type: 'nobody',
      position: 4,
    },
  ];

  for (const option of replyOptions) {
    await prisma.replyOptions.create({
      data: option,
    });
  }

  await app.close();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
