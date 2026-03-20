import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EmailQueueDto } from '../dtos/emailQueue.dto';

@Injectable()
export class EmailQueueRepository {
  private readonly logger = new Logger('Email Queue Repository');
  constructor(@InjectQueue('emailQueue') private emailQueue: Queue) {}

  public async queueEmail(emailJob: EmailQueueDto) {
    this.logger.log(
      `Queueing email to ${emailJob.to} with subject: ${emailJob.subject}`,
    );
    await this.emailQueue.add(emailJob);
  }
}
