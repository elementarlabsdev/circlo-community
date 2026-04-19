export interface AdsProviderProps {
  id: string;
  name: string;
  type: string;
  position: number;
  logoUrl?: string | null;
  description?: string | null;
  config?: any | null;
  isConfigured: boolean;
  isEnabled: boolean;
}

export class AdsProvider {
  public readonly id: string;
  public readonly name: string;
  public readonly type: string;
  public position: number;
  public logoUrl?: string | null;
  public description?: string | null;
  public config?: any | null;
  public isConfigured: boolean;
  public isEnabled: boolean;

  private constructor(props: AdsProviderProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.position = props.position;
    this.logoUrl = props.logoUrl ?? null;
    this.description = props.description ?? null;
    this.config = props.config ?? null;
    this.isConfigured = props.isConfigured;
    this.isEnabled = props.isEnabled;
  }

  static reconstitute(props: AdsProviderProps): AdsProvider {
    return new AdsProvider(props);
  }

  update(data: {
    isEnabled?: boolean;
    config?: any | null;
    isConfigured?: boolean;
  }) {
    if (typeof data.isEnabled === 'boolean') this.isEnabled = data.isEnabled;
    if (data.config !== undefined) this.config = data.config;
    if (typeof data.isConfigured === 'boolean')
      this.isConfigured = data.isConfigured;
  }

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      position: this.position,
      logoUrl: this.logoUrl ?? null,
      description: this.description ?? null,
      config: this.config ?? null,
      isConfigured: this.isConfigured,
      isEnabled: this.isEnabled,
    };
  }
}
