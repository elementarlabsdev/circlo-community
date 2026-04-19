import { Injectable } from '@nestjs/common';
import { EmailService } from '@/mail/application/services/email.service';
import { EmailSendEvent } from '@/mail/domain/events/email-send.event';

@Injectable()
export class SendEmailUseCase {
  constructor(private readonly emailNotificationService: EmailService) {}

  async execute(event: EmailSendEvent) {
    const { email, context } = event;
    await this.emailNotificationService.send(
      email,
      context.subject,
      context.html,
    );
  }
}
