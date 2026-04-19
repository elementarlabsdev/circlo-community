export interface MailProviderProps {
  id: string;
  name: string;
  type: string;
  position: number;
  description: string | null;
  isEnabled: boolean;
  isConfigured: boolean;
  isDefault: boolean;
  config?: any | null;
}

export class MailProvider {
  public readonly id: string;
  public readonly name: string;
  public readonly type: string; // e.g. 'resend', 'console', etc.
  public position: number;
  public description: string | null;
  public isEnabled: boolean;
  public isConfigured: boolean;
  public isDefault: boolean;
  public config?: any | null;

  private constructor(props: MailProviderProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.position = props.position;
    this.description = props.description;
    this.isEnabled = props.isEnabled;
    this.isConfigured = props.isConfigured;
    this.isDefault = props.isDefault;
    this.config = props.config ?? null;
  }

  /**
   * Восстанавливает агрегат из данных хранилища.
   */
  public static reconstitute(props: MailProviderProps): MailProvider {
    return new MailProvider(props);
  }

  /**
   * Метод для обновления изменяемых свойств.
   */
  public updateDetails(props: {
    position?: number;
    description?: string;
    isEnabled?: boolean;
  }): void {
    if (typeof props.position === 'number') {
      this.position = props.position;
    }
    if (typeof props.description === 'string') {
      this.description = props.description;
    }
    if (typeof props.isEnabled === 'boolean') {
      this.isEnabled = props.isEnabled;
    }
  }

  /**
   * Преобразует агрегат в "плоскую" структуру для сохранения.
   */
  public toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      position: this.position,
      description: this.description,
      isEnabled: this.isEnabled,
      isConfigured: this.isConfigured,
      isDefault: this.isDefault,
      config: this.config ?? null,
    };
  }
}
