#!/usr/bin/env bun

import { Command } from "commander";
import { commandBuild } from "./commands/build.ts";
import { commandDecode } from "./commands/decode.ts";
import { commandCompare } from "./commands/compare.ts";
import { commandQueryFees } from "./commands/query-fees.ts";
import { commandQueryExtrinsicFees } from "./commands/query-extrinsic-fees.ts";
import { commandCompactScale } from "./commands/compact-scale.ts";
import { commandGetStorage } from "./commands/get-storage.ts";
import { commandGetBlock } from "./commands/get-block.ts";
import { commandListPallets } from "./commands/list-pallets.ts";
import { commandListCalls } from "./commands/list-calls.ts";
import { commandListTypes } from "./commands/list-types.ts";
import { commandDescribeType } from "./commands/describe-type.ts";
import { commandListConstants } from "./commands/list-constants.ts";
import { commandDescribeConstant } from "./commands/describe-constant.ts";
import { commandChainDiff } from "./commands/chain-diff.ts";
import { commandAddChain } from "./commands/add-chain.ts";
import { getDefaultChain, getChainNames } from "./lib/chain-config.ts";

const VERSION = "1.0.0";
const program = new Command();

let defaultChain = "default";
let chainNames = "available chains";
try {
  defaultChain = getDefaultChain();
  chainNames = getChainNames().join(", ");
} catch (e) {
  // chains.json doesn't exist yet
}

program
  .name("extrinsic")
  .description("Polkadot/Substrate extrinsics debugging toolkit")
  .version(VERSION);

program
  .command("build")
  .description("Build a signed extrinsic from components")
  .requiredOption(
    "--address <hex>",
    "Sender address (hex string, with or without 0x)",
  )
  .requiredOption("--call <hex>", "Call data (hex string, with or without 0x)")
  .option("--nonce <number>", "Account nonce", "0")
  .option("--tip <number>", "Tip amount", "0")
  .option("--era <type>", 'Era type: "immortal" or "mortal"', "mortal")
  .option("--decode", "Also decode the built extrinsic", false)
  .action(async (options) => {
    await commandBuild({
      address: options.address,
      call: options.call,
      nonce: options.nonce,
      tip: options.tip,
      era: options.era,
      decode: options.decode,
    });
  });

program
   .command("decode")
   .description("Decode and display extrinsic structure")
   .argument("<extrinsic>", "Extrinsic hex string")
   .option("--name <string>", "Optional name/label for the extrinsic")
   .option("--chain <name>", `Chain name (${chainNames})`, defaultChain)
   .action(async (extrinsic, options) => {
     await commandDecode({ _0: extrinsic, name: options.name, chain: options.chain });
   });

program
  .command("compare")
  .description("Compare two extrinsics byte-by-byte")
  .argument("<extrinsic1>", "First extrinsic hex string")
  .argument("<extrinsic2>", "Second extrinsic hex string")
  .option("--name1 <string>", "Name for first extrinsic")
  .option("--name2 <string>", "Name for second extrinsic")
  .action(async (extrinsic1, extrinsic2, options) => {
    await commandCompare({
      _0: extrinsic1,
      _1: extrinsic2,
      name1: options.name1,
      name2: options.name2,
    });
  });

program
  .command("query-fees")
  .description("Query fees for an extrinsic on a chain")
  .requiredOption("--address <hex>", "Sender address")
  .requiredOption("--call <hex>", "Call data")
  .option("--nonce <number>", "Account nonce", "0")
  .option("--tip <number>", "Tip amount", "0")
  .option("--era <type>", 'Era type: "immortal" or "mortal"', "immortal")
  .option("--chain <name>", `Chain name (${chainNames})`, defaultChain)
  .action(async (options) => {
    await commandQueryFees({
      address: options.address,
      call: options.call,
      nonce: options.nonce,
      tip: options.tip,
      era: options.era,
      chain: options.chain,
    });
  });

program
.command("query-extrinsic-fees")
.description("Query fees for an existing extrinsic hex on a chain")
.argument("<extrinsic>", "Extrinsic hex string")
.option("--chain <name>", `Chain name (${chainNames})`, defaultChain)
.action(async (extrinsic, options) => {
await commandQueryExtrinsicFees({ _0: extrinsic, chain: options.chain });
});

program
  .command("compact-scale")
  .description("Encode/decode SCALE compact values")
  .option("--encode <number>", "Encode a number to compact hex")
  .option("--decode <hex>", "Decode compact hex to number")
  .action(async (options) => {
    await commandCompactScale({ encode: options.encode, decode: options.decode });
  });

program
  .command("get-storage")
  .description("Query storage value using state_getStorage RPC")
  .argument("<key>", "Storage key (hex)")
  .argument("[block]", "Block hash (optional)")
  .option("--chain <name>", `Chain name (${chainNames})`, defaultChain)
  .action(async (key, block, options) => {
    await commandGetStorage({ key, block, chain: options.chain });
  });

program
  .command("get-block")
  .description("Get block data using chain_getBlock RPC")
  .option("--hash <hash>", "Block hash (optional, defaults to latest block)")
  .option("--chain <name>", `Chain name (${chainNames})`, defaultChain)
  .action(async (options) => {
    await commandGetBlock({ hash: options.hash, chain: options.chain });
  });

program
  .command("list-pallets")
  .description("List all available pallets on a chain")
  .option("--chain <name>", `Chain name (${chainNames})`, defaultChain)
  .action(async (options) => {
    await commandListPallets({ chain: options.chain });
  });

program
  .command("list-calls")
  .description("List all calls, optionally filtered by pallet(s)")
  .option("--chain <name>", `Chain name (${chainNames})`, defaultChain)
  .option("--pallets <names>", "Comma-separated list of pallet names to filter")
  .action(async (options) => {
    await commandListCalls({ chain: options.chain, pallets: options.pallets });
  });

program
  .command("list-types")
  .description("List all available types on a chain")
  .option("--chain <name>", `Chain name (${chainNames})`, defaultChain)
  .option("--grouped", "Group types by namespace", false)
  .action(async (options) => {
    await commandListTypes({ chain: options.chain, grouped: options.grouped });
  });

program
   .command("describe-type")
   .description("Show detailed structure of a type")
   .argument("<type>", "Type name or search pattern")
   .option("--chain <name>", `Chain name (${chainNames})`, defaultChain)
   .action(async (type, options) => {
     await commandDescribeType({ _0: type, chain: options.chain });
   });

program
   .command("list-constants")
   .description("List all constants, optionally filtered by pallet")
   .option("--chain <name>", `Chain name (${chainNames})`, defaultChain)
   .option("--pallet <name>", "Pallet name to filter")
   .action(async (options) => {
     await commandListConstants({ chain: options.chain, pallet: options.pallet });
   });

program
   .command("describe-constant")
   .description("Show detailed information about a constant")
   .argument("<pallet>", "Pallet name")
   .argument("<constant>", "Constant name")
   .option("--chain <name>", `Chain name (${chainNames})`, defaultChain)
   .action(async (pallet, constant, options) => {
     await commandDescribeConstant({ _0: pallet, _1: constant, chain: options.chain });
   });

program
   .command("chain-diff")
  .description("Compare pallet calls and types between two chains")
  .requiredOption("--pallets <names>", "Comma-separated pallet names")
  .option("--old-chain <name>", `Old chain to compare from (${chainNames})`)
  .option("--new-chain <name>", `New chain to compare to (${chainNames})`)
  .action(async (options) => {
    await commandChainDiff({
      pallets: options.pallets,
      oldChain: options.oldChain,
      newChain: options.newChain,
    });
  });

program
  .command("add-chain")
  .description("Add a new chain to the configuration")
  .requiredOption("--name <name>", "Chain identifier (e.g., 'polkadot')")
  .requiredOption("--ws-url <url>", "WebSocket RPC URL")
  .option("--display-name <name>", "Human-readable chain name")
  .option("--papi-key <key>", "PAPI descriptor key (defaults to chain name)")
  .option("--set-default", "Set this chain as the default", false)
  .action(async (options) => {
    await commandAddChain({
      name: options.name,
      displayName: options.displayName,
      wsUrl: options.wsUrl,
      papiKey: options.papiKey,
      setDefault: options.setDefault,
    });
  });

program.parse();
