/**
 * Hardhat config — World Chain mainnet + testnet
 * Docs: https://docs.world.org
 * Chain IDs: World Chain Mainnet = 480, Testnet = 4801
 */
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-ethers';

const config: HardhatUserConfig = {
  solidity: { version: '0.8.24', settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    worldchain: {
      url: process.env.WORLD_CHAIN_RPC_URL ?? 'https://worldchain-mainnet.g.alchemy.com/public',
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 480,
    },
    worldchain_testnet: {
      url: 'https://worldchain-sepolia.g.alchemy.com/public',
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 4801,
    },
    celo: {
      url: process.env.CELO_RPC_URL ?? 'https://forno.celo.org',
      accounts: process.env.CELO_PRIVATE_KEY ? [process.env.CELO_PRIVATE_KEY] : [],
      chainId: 42220,
    },
  },
};
export default config;
