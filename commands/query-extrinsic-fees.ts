import { decodeExtrinsic } from "../lib/extrinsic-utils.ts";
import { createClient } from "polkadot-api";
import { getWsProvider } from "@polkadot-api/ws-provider";
import { CHAINS, type ChainKey } from "../lib/chains.ts";

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

interface QueryExtrinsicFeesArgs {
  _0?: string;
  chain?: string;
  [key: string]: string | number | boolean | undefined;
}

export async function commandQueryExtrinsicFees(args: QueryExtrinsicFeesArgs) {
  const extrinsic = args._0 as string;

  if (!extrinsic) {
    console.error("❌ Error: Extrinsic hex is required");
    console.log(
      "\nUsage: bun cli.ts query-extrinsic-fees <extrinsic-hex> [--chain canary|matrix]",
    );
    process.exit(1);
  }

  const chain = getChain(args.chain as string);

  console.log("Decoding extrinsic for validation...");
  decodeExtrinsic(extrinsic, "Extrinsic Validation");
  console.log();

  console.log(`Connecting to ${chain.name} (${chain.url})...`);

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
