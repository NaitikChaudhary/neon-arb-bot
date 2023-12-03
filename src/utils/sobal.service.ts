import { BalancerSDK, BalancerSdkConfig, Network } from '@sobal/sdk';
import { BigNumber } from 'ethers';
import { VAULT_ABI } from 'src/abi/sobal';
import { WNEON_ABI } from 'src/abi/wNeon';
import {
  NEON_ADDRESS,
  SOBAL_NEON_USDC_POOL,
  SOBAL_VAULT,
  USDC_CONTRACT_ADDRESS,
  WALLET_ADDRES,
  WNEON_CONTRACT_ADDRESS,
  _10,
} from 'src/config/constants';
import { WalletHandler } from 'src/utils/wallet.handler';

export class SobalService {
  private readonly walletHandler: WalletHandler;
  constructor() {
    this.walletHandler = new WalletHandler();
  }

  getOutput = async (): Promise<number> => {
    const query = {
      query: `query MyQuery {
            latestPrices(
              where: {id: "0x202c35e517fa803b537565c40f0a6965d7204609-0xea6b04272f9f62f997f666f07d3a974134f7ffb9"}
          ) {
              price
          }
      }`,
      variables: null,
      operationName: 'MyQuery',
      extensions: {
        headers: null,
      },
    };
    try {
      const data = await (
        await fetch(process.env.SOBAL_GRAPHQL_DOMAIN, {
          method: 'POST',
          body: JSON.stringify(query),
        })
      ).json();
      return Number(data.data.latestPrices[0].price) * 1.038 * 10 ** 6;
    } catch (error) {
      return 0;
    }
  };

  getData = async (
    tokenIn: string,
    tokenOut: string,
    amount: BigNumber,
    maxPools?: number,
  ) => {
    const config: BalancerSdkConfig = {
      network: Network.NEON_MAINNET,
      rpcUrl: process.env.NEON_RPC,
      enableLogging: true,
    };
    const balancer = new BalancerSDK(config);

    // Uses SOR to find optimal route for a trading pair and amount
    const gasPrice = await this.walletHandler.getProvider().getGasPrice();
    const route = await balancer.swaps.findRouteGivenOut({
      tokenIn,
      tokenOut,
      amount,
      gasPrice,
      maxPools,
    });
    return route;
  };

  swap = async (
    amount: string,
    assetIn: string = USDC_CONTRACT_ADDRESS,
    assetOut: string = NEON_ADDRESS,
  ) => {
    if (!amount) {
      return 'AMOUNT WAS NOT PROVIDED';
    }
    const vaultContract = this.walletHandler.getContract(
      SOBAL_VAULT,
      VAULT_ABI,
    );

    const singleSwap = {
      poolId: SOBAL_NEON_USDC_POOL,
      kind: 0,
      assetIn,
      assetOut,
      amount,
      userData: '0x',
    };

    const funds = {
      sender: WALLET_ADDRES,
      recipient: WALLET_ADDRES,
      fromInternalBalance: false,
      toInternalBalance: false,
    };

    const limit = '100';
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const overrides: { gasLimit: BigNumber; value?: BigNumber } = {
      gasLimit: BigNumber.from('200000'),
    };
    if (assetIn === NEON_ADDRESS) {
      overrides.value = BigNumber.from(amount);
    }
    const tx = await vaultContract.swap(
      singleSwap,
      funds,
      limit,
      deadline,
      overrides,
    );
    await tx.wait();
    return tx.hash;
  };

  getUnwrapGas = async (amount: string) => {
    try {
      const gasLimit = 30000;
      const gasPrice = await this.walletHandler.getProvider().getGasPrice();
      return {
        gasLimit: gasLimit,
        gasPrice: gasPrice.toNumber(),
        gasFee: gasPrice.mul(gasLimit).toNumber(),
      };
    } catch (error) {
      return 0;
    }
  };

  unwrap = async (amount: string) => {
    try {
      const wNeon = this.walletHandler.getContract(
        WNEON_CONTRACT_ADDRESS,
        WNEON_ABI,
      );
      const tx = await wNeon.withdraw(amount);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      return error;
    }
  };
}
