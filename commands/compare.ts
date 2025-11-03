import { compareExtrinsics } from "../lib/extrinsic-utils.ts";

interface CompareArgs {
  _0?: string;
  _1?: string;
  name1?: string;
  name2?: string;
  [key: string]: string | number | boolean | undefined;
}

export async function commandCompare(args: CompareArgs) {
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
