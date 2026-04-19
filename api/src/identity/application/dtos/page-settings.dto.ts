export class LoginPageSettingsDto {
  registrationEnabled: boolean;
  oAuthEnabled: boolean;
  monetizationPaidAccountEnabled: boolean;
  oAuthProviders: {
    type: string;
    name: string;
    iconUrl?: string;
  }[];
}

export class RegisterPageSettingsDto {
  registrationEnabled: boolean;
  oAuthEnabled: boolean;
  oAuthProviders: {
    type: string;
    name: string;
    iconUrl?: string;
  }[];
  captcha?: {
    type: string;
    siteKey?: string;
  };
}
