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

interface ListPalletsArgs {
  chain?: string;
  [key: string]: string | boolean | undefined;
}

export async function commandListPallets(args: ListPalletsArgs) {
  const chain = getChain(args.chain as string);

  console.log(`\n=== Available Pallets on ${chain.name} ===\n`);

  const descriptors = await chain.descriptor.descriptors;
  const pallets = Object.keys(descriptors.tx).sort();
  
  pallets.forEach((pallet, index) => {
    console.log(`${(index + 1).toString().padStart(3, " ")}. ${pallet}`);
  });
  
  console.log(`\nTotal: ${pallets.length} pallets`);
}
