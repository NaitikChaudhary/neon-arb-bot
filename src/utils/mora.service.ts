import { BigNumber } from 'ethers';
import { MORASWAP_V2_ROUTER } from 'src/abi/mora';
import {
  MORA_ROUTER,
  USDC_CONTRACT_ADDRESS,
  WALLET_ADDRES as WALLET_ADDRESS,
  WNEON_CONTRACT_ADDRESS,
  _10e18,
  wSOL_CONTRACT_ADDRESS,
} from 'src/config/constants';
import { WalletHandler } from 'src/utils/wallet.handler';

export class MoraService {
  private readonly walletHandler: WalletHandler;
  constructor() {
    this.walletHandler = new WalletHandler();
  }

  getOutput = async (): Promise<number> => {
    try {
      const routerContract = this.walletHandler.getContract(
        MORA_ROUTER,
        MORASWAP_V2_ROUTER,
      );
      const res = await routerContract.getAmountsIn(_10e18.toString(), [
        USDC_CONTRACT_ADDRESS,
        WNEON_CONTRACT_ADDRESS,
      ]);
      return res[0].toNumber();
    } catch (error) {
      return 0;
    }
  };

  swapToUSDC = async (amount: string) => {
    const routerContract = this.walletHandler.getContract(
      MORA_ROUTER,
      MORASWAP_V2_ROUTER,
    );
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const overrides = {
      gasLimit: BigNumber.from('4000000'),
      value: BigNumber.from(amount),
    };
    const tx = await routerContract.swapExactETHForTokens(
      '100',
      [WNEON_CONTRACT_ADDRESS, wSOL_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS],
      WALLET_ADDRESS,
      deadline,
      overrides,
    );
    await tx.wait();
    return tx.hash;
  };

  swapToNeon = async (amountOutForNeon: string, amountInMaxForUSDC: string) => {
    const routerContract = this.walletHandler.getContract(
      MORA_ROUTER,
      MORASWAP_V2_ROUTER,
    );
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const overrides = {
      gasLimit: BigNumber.from('4000000'),
    };
    const tx = await routerContract.swapTokensForExactETH(
      amountOutForNeon,
      amountInMaxForUSDC,
      [USDC_CONTRACT_ADDRESS, wSOL_CONTRACT_ADDRESS, WNEON_CONTRACT_ADDRESS],
      WALLET_ADDRESS,
      deadline,
      overrides,
    );
    await tx.wait();
    return tx.hash;
  };
}
