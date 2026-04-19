export interface CookieSettingsProps {
  id?: string;
  userId: string;
  allowFunctionalCookies: boolean;
  allowTargetingCookies: boolean;
  allowPerformanceCookies: boolean;
}

export class CookieSettings {
  private constructor(private readonly props: CookieSettingsProps) {}

  static createDefault(userId: string): CookieSettings {
    return new CookieSettings({
      userId,
      allowFunctionalCookies: false,
      allowTargetingCookies: false,
      allowPerformanceCookies: false,
    });
  }

  toPrimitives() {
    return { ...this.props };
  }
}
