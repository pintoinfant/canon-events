# Sample Hardhat 3 Beta Project (`node:test` and `viem`)

This project showcases a Hardhat 3 Beta project using the native Node.js test runner (`node:test`) and the `viem` library for Ethereum interactions.

To learn more about the Hardhat 3 Beta, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join our [Hardhat 3 Beta](https://hardhat.org/hardhat3-beta-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new) in our GitHub issue tracker.

## Project Overview

This example project includes:

- A simple Hardhat configuration file.
- Foundry-compatible Solidity unit tests.
- TypeScript integration tests using [`node:test`](nodejs.org/api/test.html), the new Node.js native test runner, and [`viem`](https://viem.sh/).
- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.

## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `node:test` tests:

```shell
npx hardhat test solidity
npx hardhat test nodejs
```

### Deploying to Hedera Testnet

This project is configured to deploy the governance contract `WikiStakeDAO` to Hedera testnet using a direct deployment script with `viem`.

1. Copy `.env.example` to `.env` and set:
```
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api
HEDERA_TESTNET_PRIVATE_KEY=0xYOUR_ECDSA_PRIVATE_KEY
HEDERA_TESTNET_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HASHSCAN_VERIFY_SERVER=https://server-verify.hashscan.io   # optional override
```

2. Compile:
```shell
pnpm hardhat compile
```

3. Deploy `WikiStakeDAO`:
```shell
pnpm hardhat run scripts/deploy-hedera.ts --network hederaTestnet
```

4. Verify source on HashScan (Smart Contract Verification API):
```shell
pnpm hardhat run scripts/verify-hashscan.ts --network hederaTestnet --address <DAO_ADDRESS> --name WikiStakeDAO
```

5. View the contract on HashScan:
```
https://hashscan.io/#/testnet/contract/<DAO_ADDRESS>
```

Note: Ensure your private key is an ECDSA key compatible with Hedera JSON-RPC; it should be a 0x-prefixed 64-byte hex string.
