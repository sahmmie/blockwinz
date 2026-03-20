import { Module } from '@nestjs/common';
import { ReferralController } from './controllers/referral.controller';
import { ReferralService } from './referral.service';
import { ReferralRepository } from './repositories/referral.repository';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ReferralController],
  providers: [ReferralRepository, ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}
