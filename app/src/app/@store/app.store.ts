import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { LoginDto, MetaTag, SocialMediaLink } from '@model/interfaces';

export interface AppStore {
  isLogged: boolean;
  isRegistrationEnabled: boolean;
  isCommentsEnabled: boolean,
  siteName: string;
  siteDescription: string;
  siteLogoUrl: string;
  siteIconUrl: string;
  profile: LoginDto | null;
  socialMediaLinks: SocialMediaLink[];
  metaTags: MetaTag[];
  imageProxyUrl: string;
  hostUrl: string;
  analyticsProvider: any;
  adsProvider: any;
  breadcrumbs: any[];
  title: string;
  unreadNotificationsCount: number;
  fontFamily: string;
  recaptchaSiteKey: string;
  capJsSiteKey: string;
  isPublicCommunity: boolean;
  announcement: any;
  rules: any[];
  monetizationCreditsEnabled: boolean;
  reactions: any[];
}

const initialAppState: AppStore = {
  profile: null,
  isLogged: false,
  isRegistrationEnabled: false,
  isCommentsEnabled: false,
  siteName: '',
  siteDescription: '',
  siteLogoUrl: '',
  siteIconUrl: '',
  socialMediaLinks: [],
  metaTags: [],
  imageProxyUrl: '',
  hostUrl: '',
  analyticsProvider: null,
  adsProvider: null,
  breadcrumbs: [],
  title: '',
  recaptchaSiteKey: '',
  capJsSiteKey: '',
  unreadNotificationsCount: 0,
  isPublicCommunity: true,
  fontFamily: 'system-ui, sans-serif',
  announcement: null,
  rules: [],
  monetizationCreditsEnabled: false,
  reactions: [],
};

export const AppStore = signalStore(
  { providedIn: 'root', protectedState: false },
  withState<AppStore>(initialAppState),
  withMethods((store) => ({
    setReactions(reactions: any) {
      let uniqueReactions: any[] = [];
      if (Array.isArray(reactions)) {
        if (reactions.length > 0 && 'reaction' in reactions[0]) {
          // It's ReactionItem[]
          uniqueReactions = reactions.map(ri => ri.reaction);
        } else {
          // It's Reaction[]
          uniqueReactions = reactions;
        }
      } else if (typeof reactions === 'object' && reactions !== null) {
        // It's a map: { [itemId: string]: ReactionItem[] }
        const allReactionItems = Object.values(reactions).flat() as any[];
        const seenIds = new Set();
        allReactionItems.forEach(ri => {
          if (ri && ri.reaction && !seenIds.has(ri.reaction.id)) {
            uniqueReactions.push(ri.reaction);
            seenIds.add(ri.reaction.id);
          }
        });
      }

      if (uniqueReactions.length > 0) {
        patchState(store, { reactions: uniqueReactions });
      }
    },
    setTitle(title: string) {
      patchState(store, { title });
    },
    setAnnouncement(announcement: any) {
      patchState(store, { announcement });
    },
    setUnreadNotificationsCount(unreadNotificationsCount: number) {
      patchState(store, { unreadNotificationsCount });
    },
    setBreadcrumbs(breadcrumbs: any[]) {
      patchState(store, { breadcrumbs });
    },
    setProfile(loginDto: LoginDto | null) {
      patchState(store, { profile: loginDto });
    },
    setSiteName(siteName: string) {
      patchState(store, { siteName });
    },
    setSiteDescription(siteDescription: string) {
      patchState(store, { siteDescription });
    },
    setRecaptchaSiteKey(recaptchaSiteKey: string) {
      patchState(store, { recaptchaSiteKey });
    },
    setCapJsSiteKey(capJsSiteKey: string) {
      patchState(store, { capJsSiteKey });
    },
    setSiteLogoUrl(siteLogoUrl: string) {
      patchState(store, { siteLogoUrl });
    },
    setSiteIconUrl(siteIconUrl: string) {
      patchState(store, { siteIconUrl });
    },
    setSocialMediaLinks(socialMediaLinks: SocialMediaLink[]) {
      patchState(store, { socialMediaLinks });
    },
    setMetaTags(metaTags: MetaTag[]) {
      patchState(store, { metaTags });
    },
    setIsLogged(isLogged: boolean) {
      patchState(store, { isLogged });
    },
    setIsRegistrationEnabled(isRegistrationEnabled: boolean) {
      patchState(store, { isRegistrationEnabled });
    },
    setIsCommentsEnabled(isCommentsEnabled: boolean) {
      patchState(store, { isCommentsEnabled });
    },
    setImageProxyUrl(imageProxyUrl: string) {
      patchState(store, { imageProxyUrl });
    },
    setAnalyticsProvider(analyticsProvider: any) {
      patchState(store, { analyticsProvider });
    },
    setAdsProvider(adsProvider: any) {
      patchState(store, { adsProvider });
    },
    setHostUrl(hostUrl: string) {
      patchState(store, { hostUrl });
    },
    setFontFamily(fontFamily: string) {
      patchState(store, { fontFamily });
    },
    setIsPublicCommunity(isPublicCommunity: boolean) {
      patchState(store, { isPublicCommunity });
    },
    setRules(rules: any[]) {
      patchState(store, { rules });
    },
    setMonetizationCreditsEnabled(monetizationCreditsEnabled: boolean) {
      patchState(store, { monetizationCreditsEnabled });
    },
  }))
);
