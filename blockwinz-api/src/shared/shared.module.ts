/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { CloudinaryService } from './services/cloudinary.service';
import { RedisService } from './services/redis.service';

@Module({
  imports: [],
  controllers: [],
  providers: [CloudinaryService, RedisService],
  exports: [CloudinaryService, RedisService],
})
export class SharedModule {}
