import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { SobalService } from './utils/sobal.service';
import { MoraService } from './utils/mora.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly sobalService: SobalService,
    private readonly moraSwapService: MoraService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/start')
  startBot(): string {
    const res: string = this.appService.startBot();
    return res;
  }

  @Get('/stop')
  stopBot(): string {
    const res: string = this.appService.stopBot();
    return res;
  }

  @Get('/sobal-swap')
  sobalSwap(@Query('amount') amount: string) {
    const res = this.sobalService.swap(amount);
    return res;
  }

  @Get('/mora-swap')
  moraSwap(@Query('amount') amount: string) {
    const res = this.moraSwapService.swapToUSDC(amount);
    return res;
  }

  @Get('/mora-swap-usdc')
  moraSwapUSDC(
    @Query('amountOut') amount: string,
    @Query('amountIn') amountIn: string,
  ) {
    const res = this.moraSwapService.swapToNeon(amount, amountIn);
    return res;
  }

  @Get('/unwrap')
  unwrap(@Query('amount') amount: string) {
    const res = this.sobalService.getUnwrapGas(amount);
    return res;
  }

  @Get('/get-mora-output')
  getMoraOutput() {
    const res = this.moraSwapService.getOutput();
    return res;
  }
}
