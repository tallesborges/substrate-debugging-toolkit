import { matrix, matrixBlockchain } from "@polkadot-api/descriptors";

const VERSION = "1.0.0";

const CHAINS = {
  canary: {
    name: "canary-matrixchain",
    url: "wss://rpc.matrix.canary.enjin.io",
    descriptor: matrix,
  },
  matrix: {
    name: "matrix-blockchain",
    url: "wss://rpc.matrix.blockchain.enjin.io",
    descriptor: matrixBlockchain,
  },
} as const;

function generateChainsHelp(): string {
  return Object.entries(CHAINS)
    .map(([key, chain]) => `  ${key.padEnd(20)}  ${chain.name} (${chain.url})`)
    .join("\n");
}

const HELP_TEXT = `
╔════════════════════════════════════════════════════════════════════════════╗
║              Polkadot/Substrate Extrinsic Debugging CLI v${VERSION}             ║
╚════════════════════════════════════════════════════════════════════════════╝

USAGE:
  bun cli.ts <command> [options]

COMMANDS:
  build              Build a signed extrinsic from components
  decode             Decode and display extrinsic structure
  compare            Compare two extrinsics byte-by-byte
  query-fees         Query fees for an extrinsic on a chain
  help               Show this help message
  version            Show CLI version

COMMAND DETAILS:

  build
    Build a properly formatted signed extrinsic with NEW TxExtension layout.

    Options:
      --address <hex>       Sender address (hex string, with or without 0x)
      --call <hex>          Call data (hex string, with or without 0x)
      --nonce <number>      Account nonce (default: 0)
      --tip <number>        Tip amount (default: 0)
      --era <type>          Era type: "immortal" or "mortal" (default: mortal)
      --decode              Also decode the built extrinsic

    Example:
      bun cli.ts build \\
        --address 0x2a2e006163694cecf967886701735254e103fd9507bd030f695df7c863f58f75 \\
        --call 0x2829451f \\
        --nonce 0 \\
        --tip 0 \\
        --era immortal \\
        --decode

  decode
    Decode a single extrinsic and display its structure.

    Arguments:
      <extrinsic-hex>       Extrinsic as hex string (required)

    Options:
      --name <string>       Optional name/label for the extrinsic

    Example:
      bun cli.ts decode 0x4d02840090ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f...

  compare
    Compare two extrinsics byte-by-byte to identify differences.

    Arguments:
      <extrinsic1-hex>      First extrinsic (required)
      <extrinsic2-hex>      Second extrinsic (required)

    Options:
      --name1 <string>      Name for first extrinsic
      --name2 <string>      Name for second extrinsic

    Example:
      bun cli.ts compare 0x5102840090ea... 0x5102840090ea... \\
        --name1 "Extrinsic 1" \\
        --name2 "Extrinsic 2"

  query-fees
    Build an extrinsic and query its fees using multiple methods.

    Options:
      --address <hex>       Sender address (required)
      --call <hex>          Call data (required)
      --nonce <number>      Account nonce (default: 0)
      --tip <number>        Tip amount (default: 0)
      --era <type>          Era type: "immortal" or "mortal" (default: immortal)
      --chain <name>        Chain: canary or matrix (default: canary)

    Methods tested:
      - TransactionPaymentApi_query_info (state_call)
      - TransactionPaymentApi_query_fee_details (state_call)
      - payment_queryInfo (legacy RPC)
      - payment_queryFeeDetails (legacy RPC)

    Example:
      bun cli.ts query-fees \\
        --address 0x2a2e006163694cecf967886701735254e103fd9507bd030f695df7c863f58f75 \\
        --call 0x0a00006ac0f1f6310a97e93599796c71f4ed620cac5c2e4a124b2967e0c06a693b000313000064a7b3b6e00d \\
        --chain canary

CHAINS:
${generateChainsHelp()}

EXAMPLES:
  # Build and decode an extrinsic
  bun cli.ts build --address 0x2a2e... --call 0x2829451f --era immortal --decode

  # Decode an existing extrinsic
  bun cli.ts decode 0x4d02840090ea... --name "My Transaction"

  # Compare two extrinsics
  bun cli.ts compare 0x5102... 0x5502... --name1 "V1" --name2 "V2"

  # Query fees on canary chain
  bun cli.ts query-fees --address 0x2a2e... --call 0x0a0000... --chain canary

For more information, visit: https://github.com/yourusername/polkadot-api-bun
`;

export function commandHelp() {
  console.log(HELP_TEXT);
}

export function commandVersion() {
  console.log(`Polkadot/Substrate Extrinsic CLI v${VERSION}`);
}
