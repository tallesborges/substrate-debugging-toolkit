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

interface DescribeConstantArgs {
  _0: string; // pallet name
  _1: string; // constant name
  chain?: string;
  [key: string]: string | boolean | undefined;
}

function formatTypeDef(def: any, lookup: any, indent = 0): string {
  const spaces = "  ".repeat(indent);

  if (def.tag === "primitive") {
    const primValue = def.value;
    if (typeof primValue === "string") {
      return primValue;
    }
    if (typeof primValue === "object" && primValue.tag) {
      return primValue.tag;
    }
    return "primitive";
  }

  if (def.tag === "composite") {
    let result = "{\n";
    for (const field of def.value) {
      const fieldType = lookup(field.type);
      const fieldName = field.name || `field${def.value.indexOf(field)}`;
      const typeName = field.typeName || getSimpleTypeName(fieldType);
      result += `${spaces}  ${fieldName}: ${typeName}\n`;
    }
    result += `${spaces}}`;
    return result;
  }

  if (def.tag === "variant") {
    let result = "enum {\n";
    for (const variant of def.value) {
      if (variant.fields && variant.fields.length > 0) {
        result += `${spaces}  ${variant.name} {\n`;
        for (const field of variant.fields) {
          const fieldType = lookup(field.type);
          const fieldName = field.name || `field${variant.fields.indexOf(field)}`;
          const typeName = field.typeName || getSimpleTypeName(fieldType);
          result += `${spaces}    ${fieldName}: ${typeName}\n`;
        }
        result += `${spaces}  }\n`;
      } else {
        result += `${spaces}  ${variant.name}\n`;
      }
    }
    result += `${spaces}}`;
    return result;
  }

  if (def.tag === "sequence") {
    const itemType = lookup(def.value);
    return `Array<${getSimpleTypeName(itemType)}>`;
  }

  if (def.tag === "array") {
    const itemType = lookup(def.value.type);
    return `[${getSimpleTypeName(itemType)}; ${def.value.len}]`;
  }

  if (def.tag === "tuple") {
    const types = def.value.map((typeId: number) => {
      const t = lookup(typeId);
      return getSimpleTypeName(t);
    });
    return `(${types.join(", ")})`;
  }

  if (def.tag === "primitive") {
    return def.value;
  }

  if (def.tag === "compact") {
    const innerType = lookup(def.value);
    return `Compact<${getSimpleTypeName(innerType)}>`;
  }

  return def.tag;
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

export async function commandDescribeConstant(args: DescribeConstantArgs) {
  const chain = getChain(args.chain as string);
  const palletName = args._0;
  const constantName = args._1;

  const metadataRaw = await chain.descriptor.getMetadata();
  const decodedMetadata = metadataCodec.dec(metadataRaw);
  const metadata = decodedMetadata.metadata.value;

  const lookupData = metadata.lookup;
  const simpleLookup = (id: number) => {
    const entry = lookupData.find((item: any) => item.id === id);
    return entry || { id, def: { tag: "unknown" } };
  };

  const pallet = metadata.pallets.find((p) => p.name === palletName);
  if (!pallet) {
    console.error(
      `❌ Error: Pallet "${palletName}" not found on ${chain.name}`,
    );
    console.error(
      `Available pallets: ${metadata.pallets.map((p) => p.name).sort().join(", ")}`,
    );
    process.exit(1);
  }

  if (!pallet.constants || pallet.constants.length === 0) {
    console.error(`❌ Error: Pallet "${palletName}" has no constants`);
    process.exit(1);
  }

  const constant = pallet.constants.find((c) => c.name === constantName);
  if (!constant) {
    console.error(
      `❌ Error: Constant "${constantName}" not found in pallet "${palletName}"`,
    );
    console.error(
      `Available constants: ${pallet.constants.map((c) => c.name).join(", ")}`,
    );
    process.exit(1);
  }

  const typeEntry = simpleLookup(constant.type);
  const typeName = getSimpleTypeName(typeEntry);

  console.log(`\n=== Constant Details on ${chain.name} ===\n`);
  console.log(`📦 ${palletName}::${constantName}`);
  console.log(`   Type ID: ${constant.type}`);
  console.log(`   Type: ${typeName}`);
  console.log(`   Value (hex): 0x${constant.value}`);
  console.log(`\n   Type Definition:`);
  console.log(formatTypeDef(typeEntry.def, simpleLookup, 1));
  console.log();
}
