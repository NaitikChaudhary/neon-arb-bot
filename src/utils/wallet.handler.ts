import { ContractInterface, ethers } from 'ethers';

export class WalletHandler {
  private wallet: ethers.Wallet;
  private provider: ethers.providers.JsonRpcProvider;
  constructor() {
    this.wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY);
    this.provider = new ethers.providers.JsonRpcProvider(process.env.NEON_RPC);
  }

  getProvider = (): ethers.providers.JsonRpcProvider => {
    return this.provider;
  };

  getContract = (
    contractAddress: string,
    contractABI: ContractInterface,
  ): ethers.Contract => {
    return new ethers.Contract(
      contractAddress,
      contractABI,
      this.wallet.connect(this.provider),
    );
  };

  getBalance = async (tokenAddress: string) => {
    const wallet = process.env.ADDRESS;
    const tokenContract = this.getContract(tokenAddress, [
      {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function',
      },
    ]);
    return await tokenContract.balanceOf(wallet);
  };

  getNeonBalance = async () => {
    return await this.provider.getBalance(process.env.ADDRESS);
  };
}
