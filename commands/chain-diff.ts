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

interface CompareTypesArgs {
  pallets: string;
  oldChain?: string;
  newChain?: string;
  [key: string]: string | boolean | undefined;
}

async function getTypesFromCalls(chainKey: string, palletNames: string[]) {
  const chain = getChain(chainKey);
  const metadataRaw = await chain.descriptor.getMetadata();
  const decodedMetadata = metadataCodec.dec(metadataRaw);
  const metadata = decodedMetadata.metadata.value;

  const lookupData = metadata.lookup;
  const simpleLookup = (id: number) => {
    const entry = lookupData.find((item: any) => item.id === id);
    return entry || { id, def: { tag: "unknown" } };
  };

  const availablePallets = metadata.pallets.map((p) => p.name);
  const invalidPallets = palletNames.filter(
    (p) => !availablePallets.includes(p),
  );

  if (invalidPallets.length > 0) {
    console.error(`❌ Error: Invalid pallet(s): ${invalidPallets.join(", ")}`);
    console.error(`\nAvailable pallets: ${availablePallets.sort().join(", ")}`);
    process.exit(1);
  }

  const typeNames = new Set<string>();
  const callsByPallet: Record<string, string[]> = {};
  const visitedTypes = new Set<number>();

  // Recursively collect all types referenced by a type ID
  const collectTypes = (typeId: number) => {
    if (visitedTypes.has(typeId)) return;
    visitedTypes.add(typeId);

    const typeEntry = simpleLookup(typeId);
    if (!typeEntry || typeEntry.def.tag === "unknown") return;

    // Add the type name if it has a path
    if (typeEntry.path && typeEntry.path.length > 0) {
      const typeName = typeEntry.path[typeEntry.path.length - 1];
      if (typeName && !typeName.match(/^[a-z]/)) {
        typeNames.add(typeName);
      }
    }

    // Recursively process fields
    if (typeEntry.def.tag === "composite" && typeEntry.def.value) {
      for (const field of typeEntry.def.value) {
        collectTypes(field.type);
      }
    } else if (typeEntry.def.tag === "variant" && typeEntry.def.value) {
      for (const variant of typeEntry.def.value) {
        if (variant.fields) {
          for (const field of variant.fields) {
            collectTypes(field.type);
          }
        }
      }
    } else if (typeEntry.def.tag === "sequence") {
      collectTypes(typeEntry.def.value);
    } else if (typeEntry.def.tag === "array") {
      collectTypes(typeEntry.def.value.type);
    } else if (typeEntry.def.tag === "tuple" && typeEntry.def.value) {
      for (const tupleType of typeEntry.def.value) {
        collectTypes(tupleType);
      }
    } else if (typeEntry.def.tag === "compact") {
      collectTypes(typeEntry.def.value);
    }
  };

  for (const palletName of palletNames) {
    const pallet = metadata.pallets.find((p) => p.name === palletName);
    if (!pallet?.calls && pallet?.calls !== 0) continue;

    const callsTypeId =
      typeof pallet.calls === "number" ? pallet.calls : pallet.calls.type;
    const callsType = simpleLookup(callsTypeId);

    if (callsType.def.tag !== "variant") continue;

    callsByPallet[palletName] = [];

    for (const variant of callsType.def.value) {
      callsByPallet[palletName].push(variant.name);

      if (variant?.fields) {
        for (const field of variant.fields) {
          // Recursively collect all types
          collectTypes(field.type);
        }
      }
    }
  }

  return { typeNames: Array.from(typeNames), callsByPallet };
}

async function describeType(
  chainKey: string,
  typeName: string,
): Promise<string | null> {
  const chain = getChain(chainKey);
  const metadataRaw = await chain.descriptor.getMetadata();
  const decodedMetadata = metadataCodec.dec(metadataRaw);
  const metadata = decodedMetadata.metadata.value;

  const lookupData = metadata.lookup;
  const matches = lookupData.filter((entry: any) => {
    if (!entry.path) return false;
    const fullPath = entry.path.join("::");
    return fullPath.includes(typeName);
  });

  if (matches.length === 0) return null;

  const entry = matches[0];
  const def = entry.def;

  if (def.tag === "composite") {
    const fields = def.value
      .map((f: any) => `    ${f.name}: ${f.typeName || "?"}`)
      .join("\n");
    return `composite {\n${fields}\n  }`;
  } else if (def.tag === "variant") {
    const variants = def.value
      .map((v: any) => {
        if (v.fields.length === 0) return `    ${v.name}`;
        const fields = v.fields
          .map((f: any) => {
            const name = f.name || `field${v.fields.indexOf(f)}`;
            return `      ${name}: ${f.typeName || "?"}`;
          })
          .join("\n");
        return `    ${v.name} {\n${fields}\n    }`;
      })
      .join("\n");
    return `enum {\n${variants}\n  }`;
  }

  return `${def.tag}`;
}

export async function commandChainDiff(args: CompareTypesArgs) {
  const oldChain = args.oldChain || "enjin";
  const newChain = args.newChain || "canary";
  const palletNames = args.pallets.split(",").map((p) => p.trim());

  console.log(
    `\n🔍 Comparing types between ${oldChain} (old) → ${newChain} (new)\n`,
  );
  console.log(`Pallets: ${palletNames.join(", ")}\n`);

  // Get calls from both chains
  const oldData = await getTypesFromCalls(oldChain, palletNames);
  const newData = await getTypesFromCalls(newChain, palletNames);

  // Compare calls first
  console.log("=== Call Changes ===\n");
  for (const pallet of palletNames) {
    const oldCalls = new Set(oldData.callsByPallet[pallet] || []);
    const newCalls = new Set(newData.callsByPallet[pallet] || []);

    const removed = [...oldCalls].filter((c) => !newCalls.has(c));
    const added = [...newCalls].filter((c) => !oldCalls.has(c));

    if (removed.length > 0 || added.length > 0) {
      console.log(`${pallet}:`);
      if (removed.length > 0) {
        console.log(`  ❌ Removed: ${removed.join(", ")}`);
      }
      if (added.length > 0) {
        console.log(`  ✅ Added: ${added.join(", ")}`);
      }
      console.log();
    }
  }

  // Compare types
  console.log("=== Type Changes ===\n");

  const allTypes = new Set([...oldData.typeNames, ...newData.typeNames]);
  const changedTypes: Array<{
    name: string;
    old: string | null;
    new: string | null;
  }> = [];

  for (const typeName of Array.from(allTypes).sort()) {
    const oldDef = await describeType(oldChain, typeName);
    const newDef = await describeType(newChain, typeName);

    if (oldDef !== newDef) {
      changedTypes.push({ name: typeName, old: oldDef, new: newDef });
    }
  }

  if (changedTypes.length === 0) {
    console.log("✅ No type changes detected");
  } else {
    for (const change of changedTypes) {
      console.log(`\n📦 ${change.name}`);
      if (!change.old) {
        console.log(`  ✅ Added in ${newChain}`);
      } else if (!change.new) {
        console.log(`  ❌ Removed in ${newChain}`);
      } else {
        console.log(`  OLD (${oldChain}):`);
        console.log(`  ${change.old}`);
        console.log(`\n  NEW (${newChain}):`);
        console.log(`  ${change.new}`);
      }
    }
  }

  console.log(
    `\n\nTotal: ${changedTypes.length} type(s) changed across ${palletNames.length} pallet(s)\n`,
  );
}
