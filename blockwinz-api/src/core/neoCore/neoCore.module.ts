/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { NeoCoreRepository } from './repositories/neoCore.repository';

const controllers = [];

const customModules = [];

@Module({
  imports: [...customModules],
  controllers: [...controllers],
  providers: [NeoCoreRepository],
  exports: [...customModules, NeoCoreRepository],
})
export class NeoCoreModule {}
