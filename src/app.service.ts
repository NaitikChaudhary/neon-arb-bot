import { Injectable } from '@nestjs/common';
import { BotService } from './bot.service';

@Injectable()
export class AppService {
  constructor(private readonly botService: BotService) {}

  getHello(): string {
    return 'Up and running v:0.0.1';
  }
  startBot(): string {
    if (this.botService.isRunning()) {
      return 'ALREADY RUNNING';
    }
    this.botService.startBot();
    return 'Bot Running';
  }
  stopBot(): string {
    if (this.botService.isRunning()) {
      this.botService.stopBot();
      return 'Bot Stopped';
    }

    return 'Bot already stopped';
  }
}
