import { createClient } from "polkadot-api";
import { getWsProvider } from "@polkadot-api/ws-provider";
import { Binary } from "polkadot-api";
import { CHAINS, type ChainKey } from "../lib/chains.ts";
import { getDefaultChain } from "../lib/chain-config.ts";

function getChain(chainKeyOrName?: string): (typeof CHAINS)[ChainKey] {
  const key = (chainKeyOrName || getDefaultChain()) as ChainKey;
  const chain = CHAINS[key];

  if (!chain) {
    console.error(
      `❌ Error: Unknown chain "${key}". Available: ${Object.keys(CHAINS).join(", ")}`,
    );
    process.exit(1);
  }

  return chain;
}

interface GetStorageArgs {
  key: string;
  block?: string;
  chain?: string;
  [key: string]: string | boolean | undefined;
}

export async function commandGetStorage(args: GetStorageArgs) {
  const storageKey = args.key;
  const blockHash = args.block as string;

  if (!storageKey) {
    console.error("❌ Error: --key is required");
    console.log(
      "\nUsage: bun cli.ts get-storage <key> [block] [--chain <name>]",
    );
    process.exit(1);
  }

  // Block hash is passed as positional argument, so it's already a string

  const chain = getChain(args.chain as string);

  console.log(`Connecting to ${chain.name} (${chain.url})...`);

  const provider = getWsProvider(chain.url);
  const client = createClient(provider);

  try {
    console.log("\n=== Querying state_getStorage ===");
    console.log(`Storage key: ${storageKey}`);
    if (blockHash) {
      console.log(`Block hash: ${blockHash}`);
    }

    // Pass the hex string directly
    const params = blockHash ? [storageKey, blockHash] : [storageKey];
    const result = await client._request("state_getStorage", params);

    console.log("✓ Success!");
    console.log("\nStorage value:");
    console.log(result || "null (no value at this key)");
  } catch (error: any) {
    console.log("✗ Failed:");
    console.log("Message:", error.message);
    process.exit(1);
  } finally {
    await client.destroy();
  }
}
