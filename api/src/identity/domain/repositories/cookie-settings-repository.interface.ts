export const COOKIE_SETTINGS_REPOSITORY = Symbol('COOKIE_SETTINGS_REPOSITORY');

export interface CookieSettingsRepositoryInterface {
  createDefaultForUser(userId: string): Promise<void>;
}
