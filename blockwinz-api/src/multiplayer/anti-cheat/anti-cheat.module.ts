import { Module } from '@nestjs/common';
import { AntiCheatService } from './anti-cheat.service';
import { MoveMadeListener } from './listeners/move-made.listener';

@Module({
  providers: [AntiCheatService, MoveMadeListener],
  exports: [AntiCheatService],
})
export class AntiCheatModule {}
