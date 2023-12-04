import { BigNumber } from 'ethers';
import {
  NEON_ADDRESS,
  USDC_CONTRACT_ADDRESS,
  _10,
  _10e18,
  _10e6,
} from './config/constants';
import { MoraService } from './utils/mora.service';
import { SobalService } from './utils/sobal.service';
import { WalletHandler } from './utils/wallet.handler';

export class BotService {
  private running: boolean = false;
  private readonly DELAY = 5000;
  private readonly sobalService: SobalService;
  private readonly moraService: MoraService;
  private readonly walletHandler: WalletHandler;
  private readonly PRICE_DIFFERENCE = 1000;
  private readonly TRADING_NEONS = 30;
  private readonly TRADING_NEON_UNITS = _10e18
    .mul(this.TRADING_NEONS)
    .toString();

  constructor() {
    this.sobalService = new SobalService();
    this.moraService = new MoraService();
    this.walletHandler = new WalletHandler();
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
      moraNeonPrice - sobalNeonPrice > this.PRICE_DIFFERENCE,
    );

    if (sobalNeonPrice > 0 && moraNeonPrice > 0) {
      if (sobalNeonPrice - moraNeonPrice > this.PRICE_DIFFERENCE) {
        try {
          console.log(
            `:::::::: SWAPPING ${this.TRADING_NEONS} NEON FOR ${(
              (sobalNeonPrice * this.TRADING_NEONS) /
              10 ** 6
            ).toFixed(2)} USDC FROM SOBAL :::::::::`,
          );

          // NEON ---> USDC
          const hash1 = await this.sobalService.swap(
            this.TRADING_NEON_UNITS,
            NEON_ADDRESS,
            USDC_CONTRACT_ADDRESS,
          );
          console.log(hash1);
          // USDC ---> NEON
          const maxUSDCAmountIn = Math.floor(
            moraNeonPrice * this.TRADING_NEONS * 1.1,
          );
          console.log(
            `:::::::: SWAPPING ${(
              (moraNeonPrice * this.TRADING_NEONS) /
              10 ** 6
            ).toFixed(2)} USDC FOR ${
              this.TRADING_NEONS
            } NEON FROM MORA :::::::`,
          );
          const hash2 = await this.moraService.swapToNeon(
            this.TRADING_NEON_UNITS,
            maxUSDCAmountIn.toString(),
          );
          console.log(hash2);
          console.log('::::: $$$ :::::');
        } catch (error) {
          console.log('FAILED to SWAP', error);
          this.stopBot();
        }
      } else if (moraNeonPrice - sobalNeonPrice > this.PRICE_DIFFERENCE) {
        try {
          // NEON ---> USDC
          console.log(
            `:::::::: SWAPPING ${this.TRADING_NEONS} NEONS FOR ${(
              (moraNeonPrice * this.TRADING_NEONS) /
              10 ** 6
            ).toFixed(2)} USDC FROM MORA :::::::`,
          );
          const hash1 = await this.moraService.swapToUSDC(
            this.TRADING_NEON_UNITS,
          );
          console.log(hash1);
          console.log(
            `:::::::: SWAPPING ${(
              (sobalNeonPrice * this.TRADING_NEONS) /
              10 ** 6
            ).toFixed(2)} USDC FOR ${
              this.TRADING_NEONS
            } NEON FROM SOBAL :::::::::`,
          );

          const USDCAmountToBeSwapped = await this.walletHandler.getBalance(
            USDC_CONTRACT_ADDRESS,
          );

          console.log(USDCAmountToBeSwapped, 'USDCAmountToBeSwapped');

          // USDC ---> NEON
          const hash2 = await this.sobalService.swap(USDCAmountToBeSwapped);
          console.log(hash2);
          console.log('::::: $$$ :::::');
        } catch (error) {
          console.log('FAILED to SWAP', error);
          this.stopBot();
        }
      }
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
