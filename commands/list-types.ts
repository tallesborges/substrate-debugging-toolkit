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

interface ListTypesArgs {
  chain?: string;
  grouped?: boolean;
  [key: string]: string | boolean | undefined;
}

export async function commandListTypes(args: ListTypesArgs) {
  const chain = getChain(args.chain as string);

  console.log(`\n=== Available Types on ${chain.name} ===\n`);

  const metadataRaw = await chain.descriptor.getMetadata();
  const decodedMetadata = metadataCodec.dec(metadataRaw);
  const metadata = decodedMetadata.metadata.value;

  const lookupData = metadata.lookup;
  
  const simpleLookup = (id: number) => {
    const entry = lookupData.find((item: any) => item.id === id);
    return entry || { id, def: { tag: "unknown" } };
  };
  
  const getTypeName = (entry: any): string => {
    let name = entry.path.join("::");
    
    if (entry.params && entry.params.length > 0) {
      const paramNames = entry.params.map((p: any) => {
        const paramType = simpleLookup(p.type);
        if (paramType.path && paramType.path.length > 0) {
          return paramType.path[paramType.path.length - 1];
        }
        return paramType.def.tag;
      });
      name += `<${paramNames.join(", ")}>`;
    }
    
    return name;
  };
  
  const typeNames = lookupData
    .filter((entry: any) => entry.path && entry.path.length > 0)
    .map((entry: any) => getTypeName(entry))
    .sort();
  
  if (args.grouped) {
    const grouped = new Map<string, string[]>();
    
    for (const typeName of typeNames) {
      const parts = typeName.split("::");
      const namespace = parts.length > 1 ? parts.slice(0, -1).join("::") : "(root)";
      const name = parts[parts.length - 1];
      
      if (!grouped.has(namespace)) {
        grouped.set(namespace, []);
      }
      grouped.get(namespace)!.push(name);
    }
    
    const sortedNamespaces = Array.from(grouped.keys()).sort();
    
    for (const namespace of sortedNamespaces) {
      const types = grouped.get(namespace)!;
      console.log(`\n📦 ${namespace} (${types.length})`);
      types.forEach(type => {
        console.log(`   - ${type}`);
      });
    }
    
    console.log(`\nTotal: ${typeNames.length} types across ${grouped.size} namespaces`);
  } else {
    typeNames.forEach((typeName: string, index: number) => {
      console.log(`${(index + 1).toString().padStart(4, " ")}. ${typeName}`);
    });
    
    console.log(`\nTotal: ${typeNames.length} types`);
  }
}
