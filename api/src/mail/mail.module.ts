import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SendEmailProcessor } from './application/queue-processors/send-email.processor';
import { EmailService } from './application/services/email.service';
import { SendEmailUseCase } from './application/use-cases/send-email.use-case';
import { OnEmailSendHandler } from './application/event-handlers/on-email-send.handler';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  controllers: [],
  providers: [
    EmailService,
    SendEmailUseCase,
    SendEmailProcessor,
    OnEmailSendHandler,
  ],
  exports: [],
})
export class MailModule {}
