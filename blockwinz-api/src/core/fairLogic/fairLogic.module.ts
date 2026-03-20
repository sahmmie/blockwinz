import { Module } from '@nestjs/common';
import { FairLogicRepository } from './repositories/fairLogic.repository';

const controllers = [];

@Module({
  imports: [],
  controllers: [...controllers],
  providers: [FairLogicRepository],
  exports: [FairLogicRepository],
})
export class FairLogicModule {}
