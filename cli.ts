#!/usr/bin/env bun

import { cac } from "cac";
import { commandBuild } from "./commands/build.ts";
import { commandDecode } from "./commands/decode.ts";
import { commandCompare } from "./commands/compare.ts";
import { commandQueryFees } from "./commands/query-fees.ts";

const VERSION = "1.0.0";
const cli = cac("extrinsic");

cli
  .command("build", "Build a signed extrinsic from components")
  .option("--address <hex>", "Sender address (hex string, with or without 0x)")
  .option("--call <hex>", "Call data (hex string, with or without 0x)")
  .option("--nonce <number>", "Account nonce", { default: "0" })
  .option("--tip <number>", "Tip amount", { default: "0" })
  .option("--era <type>", 'Era type: "immortal" or "mortal"', {
    default: "mortal",
  })
  .option("--decode", "Also decode the built extrinsic", { default: false })
  .example(
    "  $ extrinsic build --address 0x2a2e... --call 0x2829451f --era immortal --decode"
  )
  .action(async (options) => {
    await commandBuild(options);
  });

cli
  .command("decode <extrinsic>", "Decode and display extrinsic structure")
  .option("--name <string>", "Optional name/label for the extrinsic")
  .example('  $ extrinsic decode 0x4d02840090ea... --name "My Transaction"')
  .action(async (extrinsic, options) => {
    await commandDecode({ _0: extrinsic, ...options });
  });

cli
  .command(
    "compare <extrinsic1> <extrinsic2>",
    "Compare two extrinsics byte-by-byte"
  )
  .option("--name1 <string>", "Name for first extrinsic")
  .option("--name2 <string>", "Name for second extrinsic")
  .example('  $ extrinsic compare 0x5102... 0x5502... --name1 "V1" --name2 "V2"')
  .action(async (extrinsic1, extrinsic2, options) => {
    await commandCompare({ _0: extrinsic1, _1: extrinsic2, ...options });
  });

cli
  .command("query-fees", "Query fees for an extrinsic on a chain")
  .option("--address <hex>", "Sender address (required)")
  .option("--call <hex>", "Call data (required)")
  .option("--nonce <number>", "Account nonce", { default: "0" })
  .option("--tip <number>", "Tip amount", { default: "0" })
  .option("--era <type>", 'Era type: "immortal" or "mortal"', {
    default: "immortal",
  })
  .option("--chain <name>", "Chain: canary or matrix", { default: "canary" })
  .example("  $ extrinsic query-fees --address 0x2a2e... --call 0x0a0000... --chain canary")
  .action(async (options) => {
    await commandQueryFees(options);
  });

cli.version(VERSION);
cli.help();

cli.parse();
