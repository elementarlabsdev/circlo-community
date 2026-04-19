export interface CaptchaProviderProps {
  id: string;
  name: string;
  type: string;
  position: number;
  description?: string | null;
  siteKey?: string | null;
  secretKey?: string | null;
  isConfigured: boolean;
  isDefault: boolean;
  adminPanelUrl?: string | null;
}

export class CaptchaProvider {
  public readonly id: string;
  public readonly name: string;
  public readonly type: string;
  public position: number;
  public description?: string | null;
  public siteKey?: string | null;
  public secretKey?: string | null;
  public isConfigured: boolean;
  public isDefault: boolean;
  public readonly adminPanelUrl: string | null;

  private constructor(
    props: CaptchaProviderProps,
    config?: { captchaHostUrl?: string | null; domain?: string | null },
  ) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.position = props.position;
    this.description = props.description ?? null;
    this.siteKey = props.siteKey ?? null;
    this.secretKey = props.secretKey ?? null;
    this.isConfigured = props.isConfigured;
    this.isDefault = props.isDefault;
    this.adminPanelUrl = this._resolveAdminPanelUrl(
      props.adminPanelUrl,
      config,
    );
  }

  private _resolveAdminPanelUrl(
    adminPanelUrl?: string | null,
    config?: { captchaHostUrl?: string | null; domain?: string | null },
  ): string | null {
    if (adminPanelUrl) {
      return adminPanelUrl;
    }

    switch (this.type) {
      case 'recaptcha':
        return 'https://www.google.com/recaptcha/admin';
      case 'local':
        const captchaUrl =
          config?.captchaHostUrl ||
          (config?.domain ? `https://captcha.${config.domain}` : `/captcha`);
        return `${captchaUrl}/`;
      default:
        return null;
    }
  }

  static reconstitute(
    props: CaptchaProviderProps,
    config?: { captchaHostUrl?: string | null; domain?: string | null },
  ): CaptchaProvider {
    return new CaptchaProvider(props, config);
  }

  update(data: {
    siteKey?: string | null;
    secretKey?: string | null;
    isConfigured?: boolean;
    isDefault?: boolean;
  }) {
    if (data.siteKey !== undefined) this.siteKey = data.siteKey;
    if (data.secretKey !== undefined) this.secretKey = data.secretKey;

    if (this.siteKey && this.secretKey) {
      this.isConfigured = true;
    } else {
      this.isConfigured = false;
    }

    if (typeof data.isConfigured === 'boolean')
      this.isConfigured = data.isConfigured;
    if (typeof data.isDefault === 'boolean') this.isDefault = data.isDefault;
  }

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      position: this.position,
      description: this.description ?? null,
      siteKey: this.siteKey ?? null,
      secretKey: this.secretKey ?? null,
      isConfigured: this.isConfigured,
      isDefault: this.isDefault,
      adminPanelUrl: this.adminPanelUrl,
    };
  }
}
