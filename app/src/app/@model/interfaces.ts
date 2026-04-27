export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  roleType: string;
  roleName: string;
  channelSlug: string;
  channelId: string;
  preferredColorScheme: 'light' | 'dark';
  isPaid: boolean;
}

export interface LoginDto {
  id: string;
  accessToken: string;
  name: string;
  email: string;
  username: string;
  avatarUrl: string;
  credits: number;
  hasPaidAccount: boolean;
  role: {
    name: string;
    type: string;
    permissions?: any[];
  };
  preferredColorScheme: 'light' | 'dark';
  isPaid?: boolean;
  cookieConsent?: boolean;
  rules?: any[];
}

export interface NavItem {
  type: string;
  name: string;
  id: string | number;
  url: string;
  iconName?: string;
  iconUrl?: string;
  children?: NavItem[];
  authorisedOnly?: boolean;
}

export interface SocialMediaLink {
  name: string;
  url: string;
  iconUrl: string;
}

export interface MetaTag {
  id?: string;
  type?: string;
  name?: string;
  property?: string;
  content: string;
}

export interface Setting {
  data: {
    value: any;
  };
  name: string;
}

export interface QualityScore {
  sentimentScore: number;
  toxicityScore: number;
  spamScore: number;
  aiGeneratedScore: number;
  coherenceScore: number;
  readabilityScore: number;
  language: string;
  overallScore: number;
}

export interface Publication {
  id: string;
  title: string;
  content: string;
  blocksContent: any[];
  updatedAt: string;
  createdAt: string;
  slug: string;
  hasChanges: boolean;
  canonicalUrl: string;
  commentsCount: number;
  reactionsCount: number;
  readersCount: number;
  viewsCount: number;
  metaTitle: string;
  metaDescription: string;
  featuredImageUrl: string;
  discussionEnabled: boolean;
  licenseTypeId: string;
  author: Author;
  autoposted?: boolean;
  status: {
    name: string;
    type: string;
  };
  publishedAt: string;
  hash: string;
  featuredImage: {
    url: string;
  };
  isLocked: boolean;
  channel: Channel | null;
  topics: Topic[];
  readingTime: {
    minutes: number;
    text: string;
  };
  qualityScore: QualityScore;
}

export interface MyProfile {
  id: string;
  name: string;
  avatarUrl: string;
  username: string;
  jobTitle: string;
  bio: string;
  isPaid: boolean;
  role: {
    name: string;
    type: string;
    permissions?: any[];
  };
}

export interface Author {
  id: string;
  name: string;
  avatarUrl: string;
  username: string;
  jobTitle: string;
  bio: string;
  createdAt: string;
  location?: string;
  description?: string;
  publicationsCount: number;
  tutorialsCount: number;
  followersCount: number;
}

export interface Comment {
  id: string;
  htmlContent: string;
  textContent: string;
  author: Author;
  reactionsCount: number;
  repliesCount?: number;
  createdAt: string;
  replies: Comment[];
  reactions: ReactionItem[];
  isNew?: boolean;
  isHidden: boolean;
  qualityScore?: QualityScore | null;
  publication?: Publication | null;
  publicationId?: string | null;
  lesson?: any | null;
  lessonId?: string | null;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatarUrl: string;
  publicationsCount: number;
  tutorialsCount: number;
  cookieConsent?: boolean;
  cookiePreferences?: any;
  followersCount: number;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  metaTitle?: string;
  metaDescription?: string;
  publicationsCount: number;
  tutorialsCount: number;
  followersCount: number;
}

export interface Widget {
  id: string;
  name: string;
  uniqueId: string;
  data: any;
}

export interface Channel {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  publicationsCount: number;
  tutorialsCount: number;
  followersCount: number;
  description?: string;
  avatarUrl?: string;
  rules: ChannelRule[];
  metaTitle?: string;
  metaDescription?: string;
  moderators: User[];
  visibilityId?: string;
  accessType?: string;
  price?: number;
  visibility?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface ChannelRule {
  name: string;
  description: string;
}

export interface Reaction {
  id: string;
  name: string;
  type: string;
  iconUrl: string;
}

export interface ReactionItem {
  reaction: Reaction;
  totalCount: number;
  hasReaction: boolean;
}

export interface Pagination {
  pageNumber: number;
  totalItems: number;
  totalItemsCount?: number;
  totalPages: number;
  totalPagesCount?: number;
  pageSize: number;
}

export interface Page {
  id: string;
  title: string;
  content: string;
  blocksContent: any[];
  hash: string;
  updatedAt: string;
  hasChanges: boolean;
  metaTitle: string;
  metaDescription: string;
  featuredImageUrl: string;
  status: {
    name: string;
    type: string;
  };
}

export interface Menu {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
}

export interface SubscriptionTarget {
  id: string;
  type: string;
  isFollowing: boolean;
  followersCount: number;
}

export interface ChannelRule {
  id: any;
  name: string;
  description: string;
  position: number;
  channelId: string;
}

export interface MediaItem {
  id: string;
  extension: string;
  path: string;
  url: string;
  name: string;
  size: number;
  category: string;
  type: string;
  mimeType: string;
  createdAt: string;
  orientation?: 'portrait' | 'landscape' | 'square';
  payload?: {
    width?: number;
    height?: number;
    orientation?: 'portrait' | 'landscape' | 'square';
    aspectRatio?: number;
    duration?: number;
    dash?: {
      manifest: string;
    };
  };
}

export interface Thread {
  id: string;
  textContent: string;
  htmlContent: string;
  author: Author;
  createdAt: string;
  repliesCount: number;
  reactionsCount: number;
  nestedRepliesCount?: number;
  mediaItems?: MediaItem[];
  replies?: Thread[];
  reactions?: any;
  qualityScore?: QualityScore;
  respondingToId?: string | null;
  mainThreadId?: string | null;
}

export interface FeedItem {
  id: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  target: any;
}

export type LearnItem = {
  content: string,
};

export interface TutorialInterface {
  id: string;
  title: string;
  updatedAt: string;
  description: string;
  slug: string;
  hasChanges: boolean;
  canonicalUrl: string;
  commentsCount: number;
  reactionsCount: number;
  viewsCount: number;
  metaTitle: string;
  metaDescription: string;
  featuredImageUrl: string;
  discussionEnabled: boolean;
  licenseTypeId: string;
  lessonsCount: number;
  author: Author;
  status: {
    name: string;
    type: string;
  };
  publishedAt: string;
  featuredImage: {
    url: string;
  };
  isLocked: boolean;
  channel: Channel | null;
  topics: Topic[];
  estimatedTime: {
    minutes: number;
    text: string;
  };
  whatYouWillLearn: ReadonlyArray<LearnItem>;
  sections: any[];
  firstItem: {
    type: string;
    lesson: {
      slug: string;
    },
    quiz: {
      slug: string;
    }
  }
}
