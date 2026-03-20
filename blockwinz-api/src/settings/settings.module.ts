import { Module } from '@nestjs/common';
import { SettingsController } from './controllers/settings.controller';
import { FavouriteRepository } from './repositories/favourite.repository';
import { SeedsModule } from 'src/core/seeds /seeds.module';
import { SettingRepository } from './repositories/setting.repository';
import { DatabaseModule } from 'src/database/database.module';

const controllers = [SettingsController];

@Module({
  imports: [DatabaseModule, SeedsModule],
  controllers: [...controllers],
  providers: [FavouriteRepository, SettingRepository],
  exports: [FavouriteRepository, SettingRepository],
})
export class SettingsModule {}
