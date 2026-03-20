import { Module } from '@nestjs/common';
import { NeoCoreModule } from '../neoCore/neoCore.module';
import { SeedsRepository } from './repositories/seeds.repository';

const controllers: never[] = [];

@Module({
  imports: [NeoCoreModule],
  controllers: [...controllers],
  providers: [SeedsRepository],
  exports: [SeedsRepository],
})
export class SeedsModule {}
