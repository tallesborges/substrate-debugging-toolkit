/**
 * Extrinsic Debugging Utilities
 * 
 * Tools for analyzing and debugging Polkadot/Substrate extrinsics,
 * especially useful for diagnosing SignedExtensions layout mismatches.
 */

import { Binary } from "polkadot-api";

// ============================================================================
// EXTRINSIC DECODER
// ============================================================================

export interface ExtrinsicStructure {
  lengthPrefix: Uint8Array;
  versionByte: number;
  addressType: number;
  address: Uint8Array;
  signatureTypeAndData: Uint8Array;
  signedExtensions: Uint8Array;
  era?: Uint8Array;
  checkMetadataHash?: number;
  checkFuelTank?: number;
  nonce?: number;
  tip?: number;
  call?: Uint8Array;
}

/**
 * Decode an extrinsic and display its structure byte-by-byte
 */
export function decodeExtrinsic(hexString: string, name?: string): ExtrinsicStructure {
  const bytes = Binary.fromHex(hexString).asBytes();
  
  if (name) {
    console.log(`\n${"=".repeat(80)}`);
    console.log(name);
    console.log(`${"=".repeat(80)}`);
  }
  
  console.log("Total length:", bytes.length, "bytes");
  console.log("Hex:", hexString.slice(0, 50) + "...\n");
  
  let offset = 0;
  
  // Length prefix (compact encoded)
  const lengthByte1 = bytes[offset];
  const lengthPrefixSize = lengthByte1 & 0x03;
  let lengthPrefix: Uint8Array;
  
  if (lengthPrefixSize === 0) {
    lengthPrefix = bytes.slice(offset, offset + 1);
    offset += 1;
  } else if (lengthPrefixSize === 1) {
    lengthPrefix = bytes.slice(offset, offset + 2);
    offset += 2;
  } else {
    lengthPrefix = bytes.slice(offset, offset + 4);
    offset += 4;
  }
  
  console.log(`[0-${offset-1}] Length prefix:`, Binary.fromBytes(lengthPrefix).asHex());
  
  // Version byte
  const versionByte = bytes[offset];
  console.log(`[${offset}] Version:`, "0x" + versionByte.toString(16).padStart(2, '0'), 
    versionByte === 0x84 ? "(signed with extensions)" : "");
  offset += 1;
  
  // Address (1 byte type + 32 bytes address)
  const addressType = bytes[offset];
  const address = bytes.slice(offset + 1, offset + 33);
  console.log(`[${offset}] Address type:`, "0x" + addressType.toString(16).padStart(2, '0'));
  console.log(`[${offset + 1}-${offset + 32}] Address:`, Binary.fromBytes(address).asHex());
  offset += 33;
  
  // Signature (1 byte type + 64 bytes signature)
  const signatureStart = offset;
  const signatureTypeAndData = bytes.slice(offset, offset + 65);
  const signatureType = bytes[offset];
  const signature = bytes.slice(offset + 1, offset + 65);
  console.log(`[${offset}] Signature type:`, "0x" + signatureType.toString(16).padStart(2, '0'));
  console.log(`[${offset + 1}-${offset + 64}] Signature:`, Binary.fromBytes(signature).asHex().slice(0, 40) + "...");
  offset += 65;
  
  console.log(`\n[${offset}+] Signed Extensions & Call:`);
  const signedExtensions = bytes.slice(offset);
  console.log(Binary.fromBytes(signedExtensions).asHex());
  
  // Try to decode signed extensions (NEW layout with CheckMetadataHash)
  console.log("\nAttempting to decode with NEW TxExtension layout:");
  console.log("(Era | CheckMetadataHash | CheckFuelTank | Nonce | Tip | Call)");
  
  let extOffset = offset;
  
  // Era (can be 1 byte for immortal or 2 bytes for mortal)
  const eraFirstByte = bytes[extOffset];
  let era: Uint8Array;
  if (eraFirstByte === 0x00) {
    // Immortal era (1 byte)
    era = bytes.slice(extOffset, extOffset + 1);
    console.log(`[${extOffset}] Era:`, Binary.fromBytes(era).asHex(), "(immortal, 1 byte)");
    extOffset += 1;
  } else {
    // Mortal era (2 bytes)
    era = bytes.slice(extOffset, extOffset + 2);
    console.log(`[${extOffset}-${extOffset + 1}] Era:`, Binary.fromBytes(era).asHex(), "(mortal, 2 bytes)");
    extOffset += 2;
  }
  
  // CheckMetadataHash (Option: 0x00 for None, 0x01 + 32 bytes for Some)
  const checkMetadataHash = bytes[extOffset];
  console.log(`[${extOffset}] CheckMetadataHash:`, "0x" + checkMetadataHash.toString(16).padStart(2, '0'),
    checkMetadataHash === 0x00 ? "(None)" : checkMetadataHash === 0x01 ? "(Some - would be followed by 32 bytes)" : "(INVALID - should be 0x00 or 0x01!)");
  extOffset += 1;
  
  if (checkMetadataHash === 0x01) {
    console.log(`[${extOffset}-${extOffset + 31}] Metadata hash:`, Binary.fromBytes(bytes.slice(extOffset, extOffset + 32)).asHex());
    extOffset += 32;
  }
  
  // CheckFuelTank (Option: 0x00 for None, 0x01 + data for Some)
  const checkFuelTank = bytes[extOffset];
  console.log(`[${extOffset}] CheckFuelTank:`, "0x" + checkFuelTank.toString(16).padStart(2, '0'),
    checkFuelTank === 0x00 ? "(None)" : "(Some - need to parse further)");
  extOffset += 1;
  
  // For now, assume CheckFuelTank is None, so we continue
  // Nonce (compact encoded)
  const nonce = bytes[extOffset];
  console.log(`[${extOffset}] Nonce:`, "0x" + nonce.toString(16).padStart(2, '0'), "(compact)");
  extOffset += 1;
  
  // Tip (compact encoded)
  const tip = bytes[extOffset];
  console.log(`[${extOffset}] Tip:`, "0x" + tip.toString(16).padStart(2, '0'), "(compact)");
  extOffset += 1;
  
  // Call
  const call = bytes.slice(extOffset);
  console.log(`[${extOffset}+] Call (${call.length} bytes):`, Binary.fromBytes(call).asHex());
  
  return {
    lengthPrefix,
    versionByte,
    addressType,
    address,
    signatureTypeAndData,
    signedExtensions,
    era,
    checkMetadataHash,
    checkFuelTank,
    nonce,
    tip,
    call
  };
}

// ============================================================================
// EXTRINSIC COMPARISON
// ============================================================================

/**
 * Compare two extrinsics byte-by-byte to find differences
 */
export function compareExtrinsics(hex1: string, hex2: string, name1?: string, name2?: string) {
  const bytes1 = Binary.fromHex(hex1).asBytes();
  const bytes2 = Binary.fromHex(hex2).asBytes();
  
  console.log(`\n${"=".repeat(80)}`);
  console.log("COMPARING EXTRINSICS");
  console.log(`${"=".repeat(80)}`);
  console.log(`${name1 || "Extrinsic 1"}: ${bytes1.length} bytes`);
  console.log(`${name2 || "Extrinsic 2"}: ${bytes2.length} bytes`);
  console.log(`Length difference: ${bytes2.length - bytes1.length} bytes`);
  
  console.log("\nByte-by-byte comparison (first 20 differences):");
  let differences = 0;
  const maxDiff = 20;
  
  for (let i = 0; i < Math.max(bytes1.length, bytes2.length) && differences < maxDiff; i++) {
    const b1 = i < bytes1.length ? bytes1[i] : undefined;
    const b2 = i < bytes2.length ? bytes2[i] : undefined;
    
    if (b1 !== b2) {
      const b1Str = b1 !== undefined ? "0x" + b1.toString(16).padStart(2, '0') : "N/A";
      const b2Str = b2 !== undefined ? "0x" + b2.toString(16).padStart(2, '0') : "N/A";
      console.log(`[${i}] ${name1 || "Ext1"}: ${b1Str} | ${name2 || "Ext2"}: ${b2Str}`);
      differences++;
    }
  }
  
  if (differences >= maxDiff) {
    console.log(`... and more differences (showing first ${maxDiff})`);
  }
  
  // Compare signed extensions section (starting at byte 100 for typical extrinsics)
  console.log("\nSigned Extensions comparison (bytes 100-115):");
  console.log(`${name1 || "Ext1"}:`, Binary.fromBytes(bytes1.slice(100, 115)).asHex());
  console.log(`${name2 || "Ext2"}:`, Binary.fromBytes(bytes2.slice(100, 115)).asHex());
}

// ============================================================================
// EXTRINSIC BUILDER
// ============================================================================

export interface ExtrinsicComponents {
  address: string; // Hex string without 0x prefix or with
  signature?: Uint8Array; // If not provided, uses dummy 0x01 pattern
  era?: "immortal" | { period: number; phase: number }; // Default: mortal with period 64
  checkMetadataHash?: Uint8Array | null; // null = None, Uint8Array = Some(hash)
  checkFuelTank?: boolean; // Default: false (None)
  nonce?: number; // Default: 0
  tip?: number; // Default: 0
  call: string; // Hex string of the call
}

/**
 * Build a properly formatted extrinsic with the NEW TxExtension layout
 */
export function buildExtrinsic(components: ExtrinsicComponents): string {
  const versionByte = 0x84; // Signed with extensions
  
  // Address
  const addressHex = components.address.startsWith("0x") 
    ? components.address.slice(2) 
    : components.address;
  const address = Binary.fromHex("0x00" + addressHex).asBytes(); // 0x00 = AccountId type
  
  // Signature (1 type byte + 64 signature bytes = 65 total)
  const signature = components.signature || new Uint8Array(65).fill(0x01);
  if (signature.length !== 65) {
    throw new Error("Signature must be 65 bytes (1 type + 64 data)");
  }
  
  // Era
  let era: Uint8Array;
  if (components.era === "immortal") {
    era = new Uint8Array([0x00]);
  } else {
    // Default mortal era: period 64, phase 0 = 0x01f5
    era = new Uint8Array([0x01, 0xf5]);
  }
  
  // CheckMetadataHash
  let checkMetadataHashBytes: Uint8Array;
  if (components.checkMetadataHash === null || components.checkMetadataHash === undefined) {
    checkMetadataHashBytes = new Uint8Array([0x00]); // None
  } else {
    if (components.checkMetadataHash.length !== 32) {
      throw new Error("Metadata hash must be 32 bytes");
    }
    checkMetadataHashBytes = new Uint8Array([0x01, ...components.checkMetadataHash]); // Some(hash)
  }
  
  // CheckFuelTank
  const checkFuelTank = components.checkFuelTank ? new Uint8Array([0x01]) : new Uint8Array([0x00]);
  
  // Nonce (compact encoded - simplified for small values)
  const nonce = components.nonce || 0;
  const nonceBytes = encodeCompact(nonce);
  
  // Tip (compact encoded - simplified for small values)
  const tip = components.tip || 0;
  const tipBytes = encodeCompact(tip);
  
  // Call
  const callHex = components.call.startsWith("0x") ? components.call.slice(2) : components.call;
  const call = Binary.fromHex("0x" + callHex).asBytes();
  
  // Build the extrinsic body
  const body = new Uint8Array([
    versionByte,
    ...address,
    ...signature,
    ...era,
    ...checkMetadataHashBytes,
    ...checkFuelTank,
    ...nonceBytes,
    ...tipBytes,
    ...call
  ]);
  
  // Add length prefix
  const lengthPrefix = encodeCompact(body.length);
  const extrinsic = new Uint8Array([...lengthPrefix, ...body]);
  
  return "0x" + Array.from(extrinsic).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encode a number as SCALE compact
 * (Simplified version for small numbers)
 */
function encodeCompact(n: number): Uint8Array {
  if (n < 64) {
    return new Uint8Array([n << 2]);
  }
  if (n < 16384) {
    return new Uint8Array([((n & 0x3F) << 2) | 1, (n >> 6) & 0xFF]);
  }
  if (n < 1073741824) {
    return new Uint8Array([
      ((n & 0x3F) << 2) | 2,
      (n >> 6) & 0xFF,
      (n >> 14) & 0xFF,
      (n >> 22) & 0xFF
    ]);
  }
  throw new Error("Number too large for compact encoding");
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

if (import.meta.main) {
  console.log("Extrinsic Debugging Utilities");
  console.log("==============================\n");
  
  // Example 1: Decode an extrinsic
  const oldExtrinsic = "0x5102840090ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000019200400000a0000eca95101fd1e74920abb30c45b491949aff430c7c3a332e5c6ac8ec23f6bb54d13000064a7b3b6e00d";
  
  decodeExtrinsic(oldExtrinsic, "OLD LAYOUT EXTRINSIC (will show invalid CheckMetadataHash)");
  
  const newExtrinsic = "0x5102840090ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f0101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101f5000000000a0000eca95101fd1e74920abb30c45b491949aff430c7c3a332e5c6ac8ec23f6bb54d13000064a7b3b6e00d96000000";
  
  decodeExtrinsic(newExtrinsic, "NEW LAYOUT EXTRINSIC (correct)");
  
  // Example 2: Compare two extrinsics
  compareExtrinsics(oldExtrinsic, newExtrinsic, "OLD Layout", "NEW Layout");
  
  // Example 3: Build a new extrinsic
  console.log(`\n${"=".repeat(80)}`);
  console.log("BUILDING NEW EXTRINSIC");
  console.log(`${"=".repeat(80)}`);
  
  const built = buildExtrinsic({
    address: "0x90ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f",
    call: "0x0a0000eca95101fd1e74920abb30c45b491949aff430c7c3a332e5c6ac8ec23f6bb54d13000064a7b3b6e00d96000000",
    nonce: 0,
    tip: 0
  });
  
  console.log("Built extrinsic:");
  console.log(built);
  console.log("\nDecoding the built extrinsic:");
  decodeExtrinsic(built, "BUILT EXTRINSIC");
}
