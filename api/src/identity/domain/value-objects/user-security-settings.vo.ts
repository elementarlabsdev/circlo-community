import { BadRequestException } from '@nestjs/common';

/**
 * Интерфейс для свойств, описывающих настройки безопасности.
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
   * Статический фабричный метод для создания объекта настроек.
   * Устанавливает безопасные значения по умолчанию для нового пользователя.
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

    // Бизнес-правило: MFA не может быть включена, если она не настроена.
    if (props.mfaEnabled && !props.mfaConfigured) {
      throw new BadRequestException(
        'MFA cannot be enabled until it is configured.',
      );
    }

    return new UserSecuritySettings(props);
  }

  /**
   * Возвращает новый экземпляр с подтвержденной настройкой MFA.
   */
  public confirmMfaConfiguration(): UserSecuritySettings {
    return new UserSecuritySettings({ ...this, mfaConfigured: true });
  }

  /**
   * Возвращает новый экземпляр с включенной MFA.
   * @throws {Error} если MFA не настроена.
   */
  public enableMfa(): UserSecuritySettings {
    if (!this.mfaConfigured) {
      throw new Error('Attempted to enable MFA before it was configured.');
    }
    return new UserSecuritySettings({ ...this, mfaEnabled: true });
  }

  /**
   * Возвращает новый экземпляр с выключенной MFA.
   */
  public disableMfa(): UserSecuritySettings {
    return new UserSecuritySettings({ ...this, mfaEnabled: false });
  }

  /**
   * Возвращает новый экземпляр с обновленным API ключом.
   * @param apiKey Новый API ключ или null для его удаления.
   */
  public updateApiKey(apiKey: string | null): UserSecuritySettings {
    // Здесь может быть валидация формата ключа, если это необходимо
    return new UserSecuritySettings({ ...this, openAIApiKey: apiKey });
  }

  /**
   * Сравнивает текущий объект настроек с другим.
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
