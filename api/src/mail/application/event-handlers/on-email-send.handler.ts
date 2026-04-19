import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailSendEvent } from '@/mail/domain/events/email-send.event';

@EventsHandler(EmailSendEvent)
export class OnEmailSendHandler implements IEventHandler<EmailSendEvent> {
  constructor(@InjectQueue('email-queue') private emailQueue: Queue) {}

  async handle(event: EmailSendEvent) {
    await this.emailQueue.add('send-email', event, {
      delay: 1000,
      attempts: 3,
    });
  }
}
