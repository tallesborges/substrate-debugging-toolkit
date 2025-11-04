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

interface GetBlockArgs {
  hash?: string;
  chain?: string;
  [key: string]: string | boolean | undefined;
}

export async function commandGetBlock(args: GetBlockArgs) {
  const blockHash = args.hash;
  const chain = getChain(args.chain as string);

  console.log(`Connecting to ${chain.name} (${chain.url})...`);

  const provider = getWsProvider(chain.url);
  const client = createClient(provider);

  try {
    console.log("\n=== Querying chain_getBlock ===");
    if (blockHash) {
      console.log(`Block hash: ${blockHash}`);
    } else {
      console.log("Fetching latest block");
    }

    const params = blockHash ? [blockHash] : [];
    const result = await client._request("chain_getBlock", params);

    console.log("✓ Success!");
    console.log("\nBlock data:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.log("✗ Failed:");
    console.log("Message:", error.message);
    process.exit(1);
  } finally {
    await client.destroy();
  }
}
