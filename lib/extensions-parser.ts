/**
 * Dynamic Signed Extensions Parser
 *
 * Parses signed extensions based on a declarative configuration.
 * Supports: fixed-size fields, compact-encoded fields, options, and custom types.
 */

import { Binary } from "polkadot-api";
import { readFileSync } from "fs";
import { join } from "path";

export interface ExtensionField {
  name: string;
  type:
    | "unit"
    | "era"
    | "enjin_era"
    | "compact"
    | "fixed_hash_32"
    | "option_hash_32"
    | "option_u32";
}

export interface ChainExtensions {
  signedExtensions: ExtensionField[];
}

export interface ExtensionsConfig {
  [chainName: string]: ChainExtensions | Record<string, any>;
}

export interface DecodedField {
  name: string;
  type: string;
  value?: any;
  hex?: string;
  startOffset: number;
  endOffset: number;
  bytesRead: number;
  description?: string;
}

let cachedConfig: ExtensionsConfig | null = null;

function loadExtensionsConfig(): ExtensionsConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const configPath = join(process.cwd(), "extensions.json");
    const content = readFileSync(configPath, "utf-8");
    cachedConfig = JSON.parse(content);
    return cachedConfig;
  } catch (error) {
    console.error("Error loading extensions.json:", error);
    throw new Error(
      "Failed to load extensions.json. Make sure the file exists in the project root.",
    );
  }
}

function decodeCompactValue(
  bytes: Uint8Array,
  offset: number,
): { value: number; bytesRead: number } {
  const firstByte = bytes[offset];
  if (firstByte === undefined) {
    throw new Error("Not enough bytes to decode compact value");
  }

  const mode = firstByte & 0x03;

  if (mode === 0) {
    return { value: firstByte >> 2, bytesRead: 1 };
  }
  if (mode === 1) {
    if (offset + 1 >= bytes.length)
      throw new Error("Not enough bytes for 2-byte compact");
    const value = ((firstByte >> 2) | ((bytes[offset + 1] || 0) << 6)) >>> 0;
    return { value, bytesRead: 2 };
  }
  if (mode === 2) {
    if (offset + 3 >= bytes.length)
      throw new Error("Not enough bytes for 4-byte compact");
    const value =
      ((firstByte >> 2) |
        ((bytes[offset + 1] || 0) << 6) |
        ((bytes[offset + 2] || 0) << 14) |
        ((bytes[offset + 3] || 0) << 22)) >>>
      0;
    return { value, bytesRead: 4 };
  }

  throw new Error(`Invalid compact mode: ${mode}`);
}

/**
 * Decode a single field based on its type definition
 */
function decodeField(
  bytes: Uint8Array,
  offset: number,
  field: ExtensionField,
): DecodedField {
  const startOffset = offset;

  try {
    switch (field.type) {
      case "unit": {
        // Unit type has no data
        return {
          name: field.name,
          type: field.type,
          startOffset,
          endOffset: offset,
          bytesRead: 0,
          description: "(no data)",
        };
      }

      case "fixed_hash_32": {
        if (offset + 32 > bytes.length) {
          throw new Error("Not enough bytes for 32-byte hash");
        }
        const hash = bytes.slice(offset, offset + 32);
        return {
          name: field.name,
          type: field.type,
          hex: Binary.fromBytes(hash).asHex(),
          startOffset,
          endOffset: offset + 32,
          bytesRead: 32,
        };
      }

      case "era": {
        // Era: 1 byte (immortal 0x00) or 2 bytes (mortal)
        const firstByte = bytes[offset];
        if (firstByte === 0x00) {
          return {
            name: field.name,
            type: field.type,
            value: "Immortal",
            hex: "0x00",
            startOffset,
            endOffset: offset + 1,
            bytesRead: 1,
          };
        } else {
          const era = bytes.slice(offset, offset + 2);
          return {
            name: field.name,
            type: field.type,
            value: "Mortal",
            hex: Binary.fromBytes(era).asHex(),
            startOffset,
            endOffset: offset + 2,
            bytesRead: 2,
          };
        }
      }

      case "enjin_era": {
        // Enjin era: enum where 0x00 = Immortal, 1-255 = Mortal* with 16 bytes data
        const variant = bytes[offset];
        if (variant === 0x00) {
          return {
            name: field.name,
            type: field.type,
            value: "Immortal",
            hex: "0x00",
            startOffset,
            endOffset: offset + 1,
            bytesRead: 1,
          };
        } else {
          if (offset + 17 > bytes.length) {
            throw new Error(
              `Not enough bytes for Enjin Mortal${variant} era (needs 1 + 16 bytes)`,
            );
          }
          const eraData = bytes.slice(offset + 1, offset + 17);
          return {
            name: field.name,
            type: field.type,
            value: `Mortal${variant}`,
            hex: Binary.fromBytes(bytes.slice(offset, offset + 17)).asHex(),
            startOffset,
            endOffset: offset + 17,
            bytesRead: 17,
            description: `variant=0x${variant.toString(16).padStart(2, "0")}, data=${Binary.fromBytes(eraData).asHex()}`,
          };
        }
      }

      case "compact": {
        const { value, bytesRead } = decodeCompactValue(bytes, offset);
        return {
          name: field.name,
          type: field.type,
          value,
          hex: Binary.fromBytes(bytes.slice(offset, offset + bytesRead)).asHex(),
          startOffset,
          endOffset: offset + bytesRead,
          bytesRead,
        };
      }

      case "option_hash_32": {
        // Option: 0x00 = None, 0x01 + 32 bytes = Some(hash)
        const discriminant = bytes[offset];
        if (discriminant === 0x00) {
          return {
            name: field.name,
            type: field.type,
            value: "None",
            hex: "0x00",
            startOffset,
            endOffset: offset + 1,
            bytesRead: 1,
          };
        } else if (discriminant === 0x01) {
          if (offset + 33 > bytes.length) {
            throw new Error("Not enough bytes for Some(hash) option");
          }
          const hash = bytes.slice(offset + 1, offset + 33);
          return {
            name: field.name,
            type: field.type,
            value: "Some",
            hex: Binary.fromBytes(bytes.slice(offset, offset + 33)).asHex(),
            startOffset,
            endOffset: offset + 33,
            bytesRead: 33,
          };
        } else {
          throw new Error(
            `Invalid option discriminant for ${field.name}: 0x${discriminant.toString(16).padStart(2, "0")} (expected 0x00 or 0x01)`,
          );
        }
      }

      case "option_u32": {
        // Option: 0x00 = None, 0x01 + 4 bytes = Some(u32)
        const discriminant = bytes[offset];
        if (discriminant === 0x00) {
          return {
            name: field.name,
            type: field.type,
            value: "None",
            hex: "0x00",
            startOffset,
            endOffset: offset + 1,
            bytesRead: 1,
          };
        } else if (discriminant === 0x01) {
          if (offset + 5 > bytes.length) {
            throw new Error("Not enough bytes for Some(u32) option");
          }
          const u32Bytes = bytes.slice(offset + 1, offset + 5);
          const u32Value =
            (u32Bytes[0] || 0) |
            ((u32Bytes[1] || 0) << 8) |
            ((u32Bytes[2] || 0) << 16) |
            ((u32Bytes[3] || 0) << 24);
          return {
            name: field.name,
            type: field.type,
            value: u32Value,
            hex: Binary.fromBytes(bytes.slice(offset, offset + 5)).asHex(),
            startOffset,
            endOffset: offset + 5,
            bytesRead: 5,
          };
        } else {
          throw new Error(
            `Invalid option discriminant for ${field.name}: 0x${discriminant.toString(16).padStart(2, "0")} (expected 0x00 or 0x01)`,
          );
        }
      }

      default:
        throw new Error(`Unknown field type: ${field.type}`);
    }
  } catch (error) {
    console.error(
      `Error decoding ${field.name} at offset ${offset}: ${error}`,
    );
    throw error;
  }
}

/**
 * Decode all signed extensions for a chain based on configuration
 */
export function decodeSignedExtensionsByChain(
  bytes: Uint8Array,
  offset: number,
  chainName: string,
): {
  fields: DecodedField[];
  totalBytesRead: number;
} {
  const config = loadExtensionsConfig();
  const chainConfig = config[chainName];

  if (!chainConfig || !("signedExtensions" in chainConfig)) {
    const availableChains = Object.keys(config)
      .filter((k) => !k.startsWith("_"))
      .join(", ");
    throw new Error(
      `Chain "${chainName}" not found in extensions.json. Available chains: ${availableChains}`,
    );
  }

  const fields: DecodedField[] = [];
  let currentOffset = offset;

  for (const fieldDef of chainConfig.signedExtensions) {
    try {
      const decodedField = decodeField(bytes, currentOffset, fieldDef);
      console.error(
        `  [${decodedField.startOffset}-${decodedField.endOffset - 1}] ${fieldDef.name} (${fieldDef.type}): ${decodedField.hex || decodedField.value || "(no data)"}`,
      );
      fields.push(decodedField);
      currentOffset = decodedField.endOffset;
    } catch (error) {
      // Log which field failed and at what offset
      console.error(
        `\nDEBUG: Failed decoding ${fieldDef.name} (type: ${fieldDef.type}) at offset ${currentOffset}`,
      );
      console.error(`DEBUG: Current byte: 0x${(bytes[currentOffset] || 0).toString(16).padStart(2, "0")}`);
      console.error(`DEBUG: Next 16 bytes: ${Binary.fromBytes(bytes.slice(currentOffset, Math.min(currentOffset + 16, bytes.length))).asHex()}`);
      throw error;
    }
  }

  return {
    fields,
    totalBytesRead: currentOffset - offset,
  };
}

/**
 * Pretty-print decoded signed extensions
 */
export function printDecodedExtensions(fields: DecodedField[]): void {
  console.log("\nDecoded Signed Extensions:");
  console.log("-".repeat(80));

  for (const field of fields) {
    let display = `[${field.startOffset}`;
    if (field.bytesRead > 0) {
      display += `-${field.endOffset - 1}`;
    }
    display += `] ${field.name}: `;

    if (field.hex) {
      display += field.hex;
    }
    if (field.value !== undefined) {
      display += ` (${field.value})`;
    }
    if (field.description) {
      display += ` ${field.description}`;
    }

    console.log(display);
  }
}
