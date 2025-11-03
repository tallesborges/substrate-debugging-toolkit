import { buildExtrinsic, decodeExtrinsic } from "../lib/extrinsic-utils.ts";

interface BuildArgs {
  address?: string;
  call?: string;
  nonce?: string | number;
  tip?: string | number;
  era?: string;
  decode?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export async function commandBuild(args: BuildArgs) {
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
