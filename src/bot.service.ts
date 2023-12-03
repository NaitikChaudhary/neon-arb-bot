import { BigNumber } from 'ethers';
import {
  NEON_ADDRESS,
  USDC_CONTRACT_ADDRESS,
  _10,
  _10e18,
} from './config/constants';
import { MoraService } from './utils/mora.service';
import { SobalService } from './utils/sobal.service';

export class BotService {
  private running: boolean = false;
  private readonly DELAY = 5000;
  private readonly sobalService: SobalService;
  private readonly moraService: MoraService;
  private readonly PRICE_DIFFERENCE = 1000;
  private readonly TRADING_NEONS = 15;
  private readonly TRADING_NEON_UNITS = _10e18
    .mul(this.TRADING_NEONS)
    .toString();

  constructor() {
    this.sobalService = new SobalService();
    this.moraService = new MoraService();
  }

  waitTill = async (time: number) => {
    return new Promise((res) => {
      setTimeout(() => {
        res(time);
      }, time);
    });
  };

  checkPriceDifferences = async () => {
    const sobalNeonPrice = await this.sobalService.getOutput();
    const moraNeonPrice = await this.moraService.getOutput();
    console.log(
      sobalNeonPrice,
      moraNeonPrice,
      sobalNeonPrice - moraNeonPrice,
      sobalNeonPrice - moraNeonPrice > this.PRICE_DIFFERENCE,
    );

    if (
      sobalNeonPrice > 0 &&
      moraNeonPrice > 0 &&
      sobalNeonPrice - moraNeonPrice > this.PRICE_DIFFERENCE
    ) {
      try {
        console.log(
          `:::::::: SWAPPING ${this.TRADING_NEONS} NEON FOR ${(
            (sobalNeonPrice * this.TRADING_NEONS) /
            10 ** 6
          ).toFixed(2)} USDC FROM SOBAL :::::::::`,
        );

        // NEON ---> USDC
        await this.sobalService.swap(
          this.TRADING_NEON_UNITS,
          NEON_ADDRESS,
          USDC_CONTRACT_ADDRESS,
        );
        // USDC ---> NEON
        const maxUSDCAmountIn = Math.floor(
          moraNeonPrice * this.TRADING_NEONS * 1.1,
        );
        console.log(
          `:::::::: SWAPPING ${(
            (moraNeonPrice * this.TRADING_NEONS) /
            10 ** 6
          ).toFixed(2)} USDC FOR ${this.TRADING_NEONS} NEON FROM MORA :::::::`,
        );
        await this.moraService.swapToNeon(
          this.TRADING_NEON_UNITS,
          maxUSDCAmountIn.toString(),
        );
        console.log('::::: $$$ :::::');
      } catch (error) {}
    }

    await this.waitTill(this.DELAY);
    if (this.running) {
      this.checkPriceDifferences();
    }
  };

  startBot(): string {
    if (this.running) {
      return 'ALREADY RUNNING';
    }
    this.running = true;
    this.checkPriceDifferences();
    return 'Bot Running';
  }

  isRunning = () => {
    return this.running;
  };

  stopBot(): string {
    if (this.running) {
      this.running = false;
      return 'Bot Stopped';
    }

    return 'Bot already stopped';
  }
}
