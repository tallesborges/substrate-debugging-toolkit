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

interface DescribeTypeArgs {
  _0: string;
  chain?: string;
  [key: string]: string | boolean | undefined;
}

function formatTypeDef(def: any, lookup: any, indent = 0): string {
  const spaces = "  ".repeat(indent);
  
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
    return typeEntry.def.value;
  }
  
  if (typeEntry.def.tag === "compact") {
    return "Compact";
  }
  
  if (typeEntry.def.tag === "sequence") {
    return "Vec";
  }
  
  return typeEntry.def.tag;
}

export async function commandDescribeType(args: DescribeTypeArgs) {
  const chain = getChain(args.chain as string);
  const searchTerm = args._0.toLowerCase();

  const metadataRaw = await chain.descriptor.getMetadata();
  const decodedMetadata = metadataCodec.dec(metadataRaw);
  const metadata = decodedMetadata.metadata.value;

  const lookupData = metadata.lookup;
  const simpleLookup = (id: number) => {
    const entry = lookupData.find((item: any) => item.id === id);
    return entry || { id, def: { tag: "unknown" } };
  };

  const matches = lookupData.filter((entry: any) => {
    if (!entry.path || entry.path.length === 0) return false;
    const fullPath = entry.path.join("::").toLowerCase();
    const lastName = entry.path[entry.path.length - 1].toLowerCase();
    return fullPath.includes(searchTerm) || lastName.includes(searchTerm);
  });

  if (matches.length === 0) {
    console.log(`❌ No types found matching "${args._0}"`);
    process.exit(1);
  }

  console.log(`\n=== Type Details on ${chain.name} ===\n`);
  console.log(`Found ${matches.length} matching type(s):\n`);

  for (const match of matches) {
    const fullPath = match.path.join("::");
    console.log(`\n📦 ${fullPath}`);
    console.log(`   ID: ${match.id}`);
    console.log(`   Type: ${match.def.tag}`);
    console.log(`   Definition:`);
    console.log(formatTypeDef(match.def, simpleLookup, 1));
    console.log();
  }
}
