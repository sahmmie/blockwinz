import { Module, forwardRef } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from 'src/core/queue/queue.module';

@Module({
  imports: [ConfigModule, forwardRef(() => QueueModule)],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
