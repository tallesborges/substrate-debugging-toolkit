#!/usr/bin/env bun

import { parseArgs as utilParseArgs } from "util";
import { commandBuild } from "./commands/build.ts";
import { commandDecode } from "./commands/decode.ts";
import { commandCompare } from "./commands/compare.ts";
import { commandQueryFees } from "./commands/query-fees.ts";
import { commandHelp, commandVersion } from "./commands/help.ts";

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
