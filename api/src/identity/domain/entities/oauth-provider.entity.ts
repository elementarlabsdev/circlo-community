export class OAuthProvider {
  constructor(
    public readonly type: string, // 'GOOGLE', 'FACEBOOK' etc.
    public readonly name: string, // 'Google', 'Facebook'
    public readonly iconUrl?: string,
  ) {}
}
