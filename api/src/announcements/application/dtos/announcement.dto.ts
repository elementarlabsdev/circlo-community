export class AnnouncementDto {
  id: string;
  content: string;
  type: string;
  dismissable: boolean;
  requireManualDismiss: boolean;
  targetUrl?: string;
  actionText?: string;
}
