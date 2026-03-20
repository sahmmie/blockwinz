import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { EmailQueueDto } from '../dtos/emailQueue.dto';
import { EmailService } from 'src/email/email.service';

@Processor('emailQueue')
export class EmailQueueProcessor {
  private readonly logger = new Logger('Email Queue Processor');

  constructor(private readonly emailService: EmailService) {}

  @Process()
  async handleEmailJob(job: Job<EmailQueueDto>) {
    const { to, subject, html } = job.data;
    this.logger.log(`Sending email to ${to} with subject: ${subject}`);
    await this.emailService.sendEmailDirect(to, subject, html);
    this.logger.log(`Email sent to ${to}`);
  }
}
