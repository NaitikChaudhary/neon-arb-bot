import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SobalService } from './utils/sobal.service';
import { MoraService } from './utils/mora.service';
import { BotService } from './bot.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SobalService, MoraService, BotService],
})
export class AppModule {}
