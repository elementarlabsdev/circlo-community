import { BadRequestException } from '@nestjs/common';

/**
 * Interface for properties describing security settings.
 */
export interface UserSecuritySettingsProps {
  mfaConfigured: boolean;
  mfaEnabled: boolean;
  openAIApiKey: string | null;
}

export class UserSecuritySettings {
  public readonly mfaConfigured: boolean;
  public readonly mfaEnabled: boolean;
  public readonly openAIApiKey: string | null;

  private constructor(props: UserSecuritySettingsProps) {
    this.mfaConfigured = props.mfaConfigured;
    this.mfaEnabled = props.mfaEnabled;
    this.openAIApiKey = props.openAIApiKey;
    Object.freeze(this);
  }

  /**
   * Static factory method for creating the settings object.
   * Sets safe default values for a new user.
   */
  public static create(
    initialProps?: Partial<UserSecuritySettingsProps>,
  ): UserSecuritySettings {
    const defaults: UserSecuritySettingsProps = {
      mfaConfigured: false,
      mfaEnabled: false,
      openAIApiKey: null,
    };

    const props = { ...defaults, ...initialProps };

    // Business rule: MFA cannot be enabled if it is not configured.
    if (props.mfaEnabled && !props.mfaConfigured) {
      throw new BadRequestException(
        'MFA cannot be enabled until it is configured.',
      );
    }

    return new UserSecuritySettings(props);
  }

  /**
   * Returns a new instance with confirmed MFA configuration.
   */
  public confirmMfaConfiguration(): UserSecuritySettings {
    return new UserSecuritySettings({ ...this, mfaConfigured: true });
  }

  /**
   * Returns a new instance with MFA enabled.
   * @throws {Error} if MFA is not configured.
   */
  public enableMfa(): UserSecuritySettings {
    if (!this.mfaConfigured) {
      throw new Error('Attempted to enable MFA before it was configured.');
    }
    return new UserSecuritySettings({ ...this, mfaEnabled: true });
  }

  /**
   * Returns a new instance with MFA disabled.
   */
  public disableMfa(): UserSecuritySettings {
    return new UserSecuritySettings({ ...this, mfaEnabled: false });
  }

  /**
   * Returns a new instance with updated API key.
   * @param apiKey New API key or null to remove it.
   */
  public updateApiKey(apiKey: string | null): UserSecuritySettings {
    // Validation of the key format can be added here if necessary
    return new UserSecuritySettings({ ...this, openAIApiKey: apiKey });
  }

  /**
   * Compares the current settings object with another.
   */
  public equals(other: UserSecuritySettings): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return (
      this.mfaConfigured === other.mfaConfigured &&
      this.mfaEnabled === other.mfaEnabled &&
      this.openAIApiKey === other.openAIApiKey
    );
  }
}
