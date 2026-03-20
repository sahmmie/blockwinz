import { Module } from '@nestjs/common';
import { LimboModule } from './limbo/limbo.module';
import { DiceModule } from './dices/dice.module';
import { PlinkoModule } from './plinko/plinko.module';
import { MinesModule } from './mines/mines.module';
import { KenoModule } from './keno/keno.module';
import { WheelModule } from './wheel/wheel.module';

const controllers = [];

const customModules = [
  LimboModule,
  DiceModule,
  PlinkoModule,
  MinesModule,
  KenoModule,
  WheelModule,
];

@Module({
  imports: [...customModules],
  controllers: [...controllers],
  providers: [],
  exports: [...customModules],
})
export class GamesModule {}
