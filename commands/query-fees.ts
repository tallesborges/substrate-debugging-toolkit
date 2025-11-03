import { buildExtrinsic, decodeExtrinsic } from "../lib/extrinsic-utils.ts";
import { createClient } from "polkadot-api";
import { getWsProvider } from "@polkadot-api/ws-provider";
import { matrix, matrixBlockchain } from "@polkadot-api/descriptors";

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

interface QueryFeesArgs {
  address?: string;
  call?: string;
  nonce?: string | number;
  tip?: string | number;
  era?: string;
  chain?: string;
  [key: string]: string | number | boolean | undefined;
}

export async function commandQueryFees(args: QueryFeesArgs) {
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
