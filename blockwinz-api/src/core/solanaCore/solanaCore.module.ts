/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { SolanaCoreRepository } from './repositories/solanaCore.repository';
import { SolanaCoreController } from './controllers/solanaCore.controller';

const controllers = [SolanaCoreController];

const customModules = [];

@Module({
  imports: [...customModules],
  controllers: [...controllers],
  providers: [SolanaCoreRepository],
  exports: [...customModules, SolanaCoreRepository],
})
export class SolanaCoreModule {}
