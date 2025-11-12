import { CHAINS, type ChainKey } from "../lib/chains.ts";
import { metadata as metadataCodec } from "@polkadot-api/substrate-bindings";
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

interface ListConstantsArgs {
  chain?: string;
  pallet?: string;
  [key: string]: string | boolean | undefined;
}

function getSimpleTypeName(typeEntry: any): string {
  if (typeEntry.path && typeEntry.path.length > 0) {
    return typeEntry.path.join("::");
  }

  if (typeEntry.def.tag === "primitive") {
    const primValue = typeEntry.def.value;
    if (typeof primValue === "string") {
      return primValue;
    }
    if (typeof primValue === "object" && primValue.tag) {
      return primValue.tag;
    }
    return "primitive";
  }

  if (typeEntry.def.tag === "compact") {
    return "Compact";
  }

  if (typeEntry.def.tag === "sequence") {
    return "Vec";
  }

  return typeEntry.def.tag;
}

export async function commandListConstants(args: ListConstantsArgs) {
  const chain = getChain(args.chain as string);

  const metadataRaw = await chain.descriptor.getMetadata();
  const decodedMetadata = metadataCodec.dec(metadataRaw);
  const metadata = decodedMetadata.metadata.value;

  const pallets = args.pallet
    ? [args.pallet]
    : metadata.pallets.map((p) => p.name).sort();

  const availablePallets = metadata.pallets.map((p) => p.name);
  const invalidPallets = pallets.filter(
    (p) => !availablePallets.includes(p),
  );

  if (invalidPallets.length > 0) {
    console.error(`❌ Error: Invalid pallet(s): ${invalidPallets.join(", ")}`);
    console.error(`\nAvailable pallets: ${availablePallets.sort().join(", ")}`);
    process.exit(1);
  }

  console.log(`\n=== Constants on ${chain.name} ===\n`);

  let totalConstants = 0;

  const lookupData = metadata.lookup;
  const simpleLookup = (id: number) => {
    const entry = lookupData.find((item: any) => item.id === id);
    return entry || { id, def: { tag: "unknown" } };
  };

  for (const palletName of pallets.sort()) {
    const pallet = metadata.pallets.find((p) => p.name === palletName);
    if (!pallet?.constants || pallet.constants.length === 0) continue;

    console.log(`${palletName} (${pallet.constants.length}):`);

    for (const constant of pallet.constants) {
      const typeEntry = simpleLookup(constant.type);
      const typeName = getSimpleTypeName(typeEntry);
      console.log(`  - ${constant.name}: ${typeName}`);
      totalConstants++;
    }
    console.log();
  }

  console.log(
    `Total: ${totalConstants} constant(s) across ${pallets.length} pallet(s)`,
  );
}
