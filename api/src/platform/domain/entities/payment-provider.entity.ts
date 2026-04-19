export interface PaymentProviderProps {
  id: string;
  name: string;
  type: string;
  position: number;
  logoUrl?: string | null;
  config?: any | null;
  isConfigured: boolean;
  isEnabled: boolean;
  isDefault: boolean;
}

export class PaymentProvider {
  public readonly id: string;
  public readonly name: string;
  public readonly type: string;
  public position: number;
  public logoUrl?: string | null;
  public config?: any | null;
  public isConfigured: boolean;
  public isEnabled: boolean;
  public isDefault: boolean;

  private constructor(props: PaymentProviderProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.position = props.position;
    this.logoUrl = props.logoUrl ?? null;
    this.config = props.config ?? null;
    this.isConfigured = props.isConfigured;
    this.isEnabled = props.isEnabled;
    this.isDefault = props.isDefault;
  }

  static reconstitute(props: PaymentProviderProps): PaymentProvider {
    return new PaymentProvider(props);
  }

  update(data: { isEnabled?: boolean; config?: any | null; isConfigured?: boolean; isDefault?: boolean }) {
    if (typeof data.isEnabled === 'boolean') this.isEnabled = data.isEnabled;
    if (data.config !== undefined) this.config = data.config;
    if (typeof data.isConfigured === 'boolean') this.isConfigured = data.isConfigured;
    if (typeof data.isDefault === 'boolean') this.isDefault = data.isDefault;
  }

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      position: this.position,
      logoUrl: this.logoUrl ?? null,
      config: this.config ?? null,
      isConfigured: this.isConfigured,
      isEnabled: this.isEnabled,
      isDefault: this.isDefault,
    };
  }
}
