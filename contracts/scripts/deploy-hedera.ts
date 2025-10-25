/**
 * deploy-hedera.ts
 *
 * Deploys WikiStakeDAO to Hedera testnet using viem (hardhat-toolbox-viem).
 *
 * Usage:
 *   1. Ensure .env contains:
 *        HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api
 *        HEDERA_TESTNET_PRIVATE_KEY=0x...
 *   2. pnpm hardhat compile
 *   3. pnpm hardhat run scripts/deploy-hedera.ts --network hederaTestnet
 *   4. Verify source:
 *        pnpm hardhat run scripts/verify-hashscan.ts --network hederaTestnet --address <DAO_ADDRESS> --name WikiStakeDAO
 */

import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const wallets = await viem.getWalletClients();
  if (!wallets.length) throw new Error("No wallet clients available from viem provider");
  const deployer = wallets[0];
  console.log("Deployer address:", deployer.account.address);

  // Deploy WikiStakeDAO (no constructor args)
  const dao = await (viem as any).deployContract("WikiStakeDAO", []);
  console.log("WikiStakeDAO deployed at:", dao.address);

  // Explorer / HashScan link
  console.log("WikiStakeDAO HashScan:", `https://hashscan.io/#/testnet/contract/${dao.address}`);

  // Optional: log block number and contract balance
  const latestBlock = await publicClient.getBlockNumber();
  console.log("Latest block number:", latestBlock.toString());

  const daoBalance = await publicClient.getBalance({ address: dao.address });
  console.log("DAO initial balance (should be 0):", daoBalance.toString());
}

main().catch(err => {
  console.error("Deployment script error:", err);
  process.exitCode = 1;
});
