import { Module } from '@nestjs/common';
import { ReferralController } from './controllers/referral.controller';
import { ReferralService } from './referral.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ReferralController],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}
