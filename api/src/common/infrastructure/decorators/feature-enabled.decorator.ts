import { SetMetadata } from '@nestjs/common';

export const FEATURE_ENABLED_KEY = 'feature_enabled';
export const FeatureEnabled = (name: string) => SetMetadata(FEATURE_ENABLED_KEY, name);
