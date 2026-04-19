export interface LoginContext {
  ipAddress: string;
  userAgent?: string | null;
  device: string;
  location?: string | null;
}
