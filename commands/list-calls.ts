import { CHAINS, type ChainKey } from "../lib/chains.ts";
import { getLookupFn } from "@polkadot-api/metadata-builders";
import { metadata as metadataCodec } from "@polkadot-api/substrate-bindings";

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

interface ListCallsArgs {
  chain?: string;
  pallets?: string;
  [key: string]: string | boolean | undefined;
}

export async function commandListCalls(args: ListCallsArgs) {
  const chain = getChain(args.chain as string);

  const metadataRaw = await chain.descriptor.getMetadata();
  const decodedMetadata = metadataCodec.dec(metadataRaw);
  const metadata = decodedMetadata.metadata.value;

  const lookupData = metadata.lookup;
  const simpleLookup = (id: number) => {
    const entry = lookupData.find((item: any) => item.id === id);
    return entry || { id, def: { tag: "unknown" } };
  };

  const requestedPallets = args.pallets
    ? args.pallets.split(",").map((p) => p.trim())
    : metadata.pallets.map((p) => p.name).sort();

  const availablePallets = metadata.pallets.map((p) => p.name);
  const invalidPallets = requestedPallets.filter(
    (p) => !availablePallets.includes(p),
  );

  if (invalidPallets.length > 0) {
    console.error(`❌ Error: Invalid pallet(s): ${invalidPallets.join(", ")}`);
    console.error(`\nAvailable pallets: ${availablePallets.sort().join(", ")}`);
    process.exit(1);
  }

  console.log(`\n=== Calls on ${chain.name} ===\n`);

  let totalCalls = 0;

  for (const palletName of requestedPallets.sort()) {
    const pallet = metadata.pallets.find((p) => p.name === palletName);
    if (!pallet?.calls && pallet?.calls !== 0) continue;

    const callsTypeId =
      typeof pallet.calls === "number" ? pallet.calls : pallet.calls.type;
    const callsType = simpleLookup(callsTypeId);

    if (callsType.def.tag !== "variant") continue;

    const callNames = callsType.def.value.map((v: any) => v.name).sort();
    totalCalls += callNames.length;

    console.log(`${palletName} (${callNames.length}):`);

    for (const callName of callNames) {
      const variant = callsType.def.value.find(
        (v: any) => v.name === callName,
      );
      const args: string[] = [];

      if (variant?.fields) {
        for (const field of variant.fields) {
          const fieldType = simpleLookup(field.type);
          const argName = field.name || `arg${variant.fields.indexOf(field)}`;
          const typeName = field.typeName || fieldType.def.tag;
          args.push(`${argName}: ${typeName}`);
        }
      }

      console.log(`  - ${callName}(${args.join(", ")})`);
    }
    console.log();
  }

  console.log(
    `Total: ${totalCalls} calls across ${requestedPallets.length} pallet(s)`,
  );
}
