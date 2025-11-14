import { decodeExtrinsic } from "../lib/extrinsic-utils.ts";
import { getDefaultChain } from "../lib/chain-config.ts";

interface DecodeArgs {
  _0?: string;
  name?: string;
  chain?: string;
  [key: string]: string | number | boolean | undefined;
}

export async function commandDecode(args: DecodeArgs) {
  const extrinsicHex = args._0 as string;
  const name = (args.name as string) || "Decoded Extrinsic";
  let chain = (args.chain as string) || undefined;

  if (!extrinsicHex) {
    console.error("❌ Error: Extrinsic hex string required");
    console.log("\nUsage: bun cli.ts decode <extrinsic-hex> [--name <string>] [--chain <name>]");
    process.exit(1);
  }

  // Use default chain if not specified
  if (!chain) {
    try {
      chain = getDefaultChain();
    } catch (e) {
      // No default chain configured, proceed without chain-specific decoding
    }
  }

  await decodeExtrinsic(extrinsicHex, name, chain);
}
