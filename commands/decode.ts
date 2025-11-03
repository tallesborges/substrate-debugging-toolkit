import { decodeExtrinsic } from "../lib/extrinsic-utils.ts";

interface DecodeArgs {
  _0?: string;
  name?: string;
  [key: string]: string | number | boolean | undefined;
}

export async function commandDecode(args: DecodeArgs) {
  const extrinsicHex = args._0 as string;
  const name = (args.name as string) || "Decoded Extrinsic";

  if (!extrinsicHex) {
    console.error("❌ Error: Extrinsic hex string required");
    console.log("\nUsage: bun cli.ts decode <extrinsic-hex> [--name <string>]");
    process.exit(1);
  }

  decodeExtrinsic(extrinsicHex, name);
}
