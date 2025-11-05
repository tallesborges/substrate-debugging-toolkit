#!/usr/bin/env bun

import { Command } from "commander";
import { commandBuild } from "./commands/build.ts";
import { commandDecode } from "./commands/decode.ts";
import { commandCompare } from "./commands/compare.ts";
import { commandQueryFees } from "./commands/query-fees.ts";
import { commandQueryExtrinsicFees } from "./commands/query-extrinsic-fees.ts";
import { commandGetStorage } from "./commands/get-storage.ts";
import { commandGetBlock } from "./commands/get-block.ts";

const VERSION = "1.0.0";
const program = new Command();

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
  .action(async (extrinsic, options) => {
    await commandDecode({ _0: extrinsic, name: options.name });
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
  .option("--chain <name>", "Chain: canary or matrix", "canary")
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
  .option("--chain <name>", "Chain: canary or matrix", "canary")
  .action(async (extrinsic, options) => {
    await commandQueryExtrinsicFees({ _0: extrinsic, chain: options.chain });
  });

program
  .command("get-storage")
  .description("Query storage value using state_getStorage RPC")
  .argument("<key>", "Storage key (hex)")
  .argument("[block]", "Block hash (optional)")
  .option("--chain <name>", "Chain: canary or matrix", "canary")
  .action(async (key, block, options) => {
    await commandGetStorage({ key, block, chain: options.chain });
  });

program
  .command("get-block")
  .description("Get block data using chain_getBlock RPC")
  .option("--hash <hash>", "Block hash (optional, defaults to latest block)")
  .option("--chain <name>", "Chain: canary or matrix", "canary")
  .action(async (options) => {
    await commandGetBlock({ hash: options.hash, chain: options.chain });
  });

program.parse();
