#!/usr/bin/env bun

/**
 * Polkadot/Substrate Extrinsic Debugging CLI
 *
 * Comprehensive command-line interface for extrinsic operations including:
 * - Building extrinsics
 * - Decoding extrinsics (from hex or bytes)
 * - Comparing extrinsics
 * - Querying fees
 * - Running fee matrix tests
 */

import { parseArgs as utilParseArgs } from "util";
import {
  decodeExtrinsic,
  compareExtrinsics,
  buildExtrinsic,
} from "./lib/extrinsic-utils.ts";
import { createClient } from "polkadot-api";
import { getWsProvider } from "@polkadot-api/ws-provider";
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

type ChainKey = keyof typeof CHAINS;

function getChain(chainKeyOrName?: string): (typeof CHAINS)[ChainKey] {
  const key = (chainKeyOrName || "canary") as ChainKey;
  const chain = CHAINS[key];

  if (!chain) {
    console.error(
      `❌ Error: Unknown chain "${key}". Available: ${Object.keys(CHAINS).join(", ")}`,
    );
    process.exit(1);
  }

  return chain;
}

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

interface CommandArgs {
  [key: string]: string | number | boolean | undefined;
}

function parseArgs(): { command: string; args: CommandArgs } {
  const argv = Bun.argv.slice(2);

  if (argv.length === 0) {
    return { command: "help", args: {} };
  }

  const command = argv[0];

  const { values, positionals } = utilParseArgs({
    args: Bun.argv.slice(2),
    options: {
      address: { type: "string" },
      call: { type: "string" },
      nonce: { type: "string" },
      tip: { type: "string" },
      era: { type: "string" },
      chain: { type: "string" },
      name: { type: "string" },
      name1: { type: "string" },
      name2: { type: "string" },
      decode: { type: "boolean" },
    },
    allowPositionals: true,
    strict: false,
  });

  const args: CommandArgs = { ...values };

  positionals.slice(1).forEach((pos, index) => {
    args[`_${index}`] = pos;
  });

  return { command: command || "help", args };
}

async function commandBuild(args: CommandArgs) {
  const address = args.address as string;
  const call = args.call as string;
  const nonce = args.nonce ? Number(args.nonce) : 0;
  const tip = args.tip ? Number(args.tip) : 0;
  const era = (args.era as string) === "mortal" ? undefined : "immortal";
  const shouldDecode = args.decode as boolean;

  if (!address || !call) {
    console.error("❌ Error: --address and --call are required");
    console.log(
      "\nUsage: bun cli.ts build --address <hex> --call <hex> [--nonce <n>] [--tip <n>] [--era immortal|mortal] [--decode]",
    );
    process.exit(1);
  }

  console.log("Building extrinsic with parameters:");
  console.log("  Address:", address);
  console.log("  Call:", call);
  console.log("  Nonce:", nonce);
  console.log("  Tip:", tip);
  console.log("  Era:", era || "mortal (default)");
  console.log();

  const extrinsic = buildExtrinsic({
    address,
    call,
    nonce,
    tip,
    era: era as "immortal" | undefined,
  });

  console.log("✓ Built extrinsic:");
  console.log(extrinsic);
  console.log();

  if (shouldDecode) {
    console.log("Decoding built extrinsic...");
    decodeExtrinsic(extrinsic, "Built Extrinsic");
  }
}

async function commandDecode(args: CommandArgs) {
  const extrinsicHex = args._0 as string;
  const name = (args.name as string) || "Decoded Extrinsic";

  if (!extrinsicHex) {
    console.error("❌ Error: Extrinsic hex string required");
    console.log("\nUsage: bun cli.ts decode <extrinsic-hex> [--name <string>]");
    process.exit(1);
  }

  decodeExtrinsic(extrinsicHex, name);
}

async function commandCompare(args: CommandArgs) {
  const extrinsic1 = args._0 as string;
  const extrinsic2 = args._1 as string;
  const name1 = (args.name1 as string) || "Extrinsic 1";
  const name2 = (args.name2 as string) || "Extrinsic 2";

  if (!extrinsic1 || !extrinsic2) {
    console.error("❌ Error: Two extrinsic hex strings required");
    console.log(
      "\nUsage: bun cli.ts compare <extrinsic1-hex> <extrinsic2-hex> [--name1 <string>] [--name2 <string>]",
    );
    process.exit(1);
  }

  compareExtrinsics(extrinsic1, extrinsic2, name1, name2);
}

async function commandQueryFees(args: CommandArgs) {
  const address = args.address as string;
  const call = args.call as string;
  const nonce = args.nonce ? Number(args.nonce) : 0;
  const tip = args.tip ? Number(args.tip) : 0;
  const era = (args.era as string) === "mortal" ? undefined : "immortal";

  if (!address || !call) {
    console.error("❌ Error: --address and --call are required");
    console.log(
      "\nUsage: bun cli.ts query-fees --address <hex> --call <hex> [--nonce <n>] [--tip <n>] [--era immortal|mortal] [--chain canary|matrix]",
    );
    process.exit(1);
  }

  const chain = getChain(args.chain as string);

  console.log("Building extrinsic...");
  const extrinsic = buildExtrinsic({
    address,
    call,
    nonce,
    tip,
    era: era as "immortal" | undefined,
  });

  console.log("Generated extrinsic:");
  console.log(extrinsic);
  console.log();

  decodeExtrinsic(extrinsic, "Generated Extrinsic Validation");

  console.log(`\nConnecting to ${chain.name} (${chain.url})...`);

  const provider = getWsProvider(chain.url);
  const client = createClient(provider);

  try {
    console.log("\n=== Attempting TransactionPaymentApi_query_info ===");
    try {
      const result1 = await client._request("state_call", [
        "TransactionPaymentApi_query_info",
        extrinsic,
      ]);
      console.log("✓ Success!");
      console.log(JSON.stringify(result1, null, 2));
    } catch (error: any) {
      console.log("✗ Failed:");
      console.log("Message:", error.message);
    }

    console.log("\n=== Attempting payment_queryInfo ===");
    try {
      const result2 = await client._request("payment_queryInfo", [extrinsic]);
      console.log("✓ Success!");
      console.log(JSON.stringify(result2, null, 2));
    } catch (error: any) {
      console.log("✗ Failed:");
      console.log("Message:", error.message);
    }

    console.log("\n=== Attempting payment_queryFeeDetails ===");
    try {
      const result3 = await client._request("payment_queryFeeDetails", [
        extrinsic,
      ]);
      console.log("✓ Success!");
      console.log(JSON.stringify(result3, null, 2));
    } catch (error: any) {
      console.log("✗ Failed:");
      console.log("Message:", error.message);
    }
  } finally {
    await client.destroy();
  }
}

function commandHelp() {
  console.log(HELP_TEXT);
}

function commandVersion() {
  console.log(`Polkadot/Substrate Extrinsic CLI v${VERSION}`);
}

async function main() {
  const { command, args } = parseArgs();

  try {
    switch (command) {
      case "build":
        await commandBuild(args);
        break;
      case "decode":
        await commandDecode(args);
        break;
      case "compare":
        await commandCompare(args);
        break;
      case "query-fees":
        await commandQueryFees(args);
        break;
      case "help":
      case "--help":
      case "-h":
        commandHelp();
        break;
      case "version":
      case "--version":
      case "-v":
        commandVersion();
        break;
      default:
        console.error(`❌ Error: Unknown command "${command}"`);
        console.log('\nRun "bun cli.ts help" for usage information.');
        process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Fatal error:");
    console.error(error);
    process.exit(1);
  }
}

main();
