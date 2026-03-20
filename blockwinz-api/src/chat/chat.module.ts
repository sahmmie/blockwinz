import { Module } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { SharedModule } from 'src/shared/shared.module';
import { ChatGateway } from './controllers/chat.controller';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/shared/services/redis.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule, SharedModule, AuthenticationModule],
  controllers: [],
  providers: [
    ChatGateway,
    ChatService,
    JwtService,
    RedisService,
  ],
})
export class ChatModule {}
