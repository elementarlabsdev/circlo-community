import { OAuthProvider } from '../entities/oauth-provider.entity';
export const OAUTH_PROVIDER_REPOSITORY = 'OAuthProviderRepository';
export interface OAuthProviderRepositoryInterface {
  findAllActive(): Promise<OAuthProvider[]>;
}
