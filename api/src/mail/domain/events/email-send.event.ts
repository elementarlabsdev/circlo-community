import { EmailEventContextInterface } from '@/mail/domain/model/email-event-context.interface';

export class EmailSendEvent {
  constructor(
    public readonly email: string,
    public readonly context: EmailEventContextInterface,
  ) {}
}
