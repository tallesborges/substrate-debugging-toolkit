import { Binary } from "polkadot-api";

/**
 * Encode a number as SCALE compact
 * (Simplified version for small numbers)
 */
function encodeCompact(n: number): Uint8Array {
  if (n < 64) {
    return new Uint8Array([n << 2]);
  }
  if (n < 16384) {
    return new Uint8Array([((n & 0x3f) << 2) | 1, (n >> 6) & 0xff]);
  }
  if (n < 1073741824) {
    return new Uint8Array([
      ((n & 0x3f) << 2) | 2,
      (n >> 6) & 0xff,
      (n >> 14) & 0xff,
      (n >> 22) & 0xff,
    ]);
  }
  throw new Error("Number too large for compact encoding");
}

/**
 * Decode SCALE compact encoded bytes back to a number
 */
function decodeCompact(bytes: Uint8Array): { value: number; bytesUsed: number } {
  if (bytes.length === 0) {
    throw new Error("Empty bytes for compact decoding");
  }

  const firstByte = bytes[0]!;
  const mode = firstByte & 0x03;

  if (mode === 0) {
    // Single byte: value = firstByte >> 2
    return { value: firstByte >> 2, bytesUsed: 1 };
  } else if (mode === 1) {
    // Two bytes: value = ((firstByte >> 2) & 0x3f) | (secondByte << 6)
    if (bytes.length < 2) {
      throw new Error("Not enough bytes for 2-byte compact encoding");
    }
    const value = ((firstByte >> 2) & 0x3f) | (bytes[1]! << 6);
    return { value, bytesUsed: 2 };
  } else if (mode === 2) {
    // Four bytes: value = ((firstByte >> 2) & 0x3f) | (b2 << 6) | (b3 << 14) | (b4 << 22)
    if (bytes.length < 4) {
      throw new Error("Not enough bytes for 4-byte compact encoding");
    }
    const value =
      ((firstByte >> 2) & 0x3f) |
      (bytes[1]! << 6) |
      (bytes[2]! << 14) |
      (bytes[3]! << 22);
    return { value, bytesUsed: 4 };
  } else {
    throw new Error("Invalid compact encoding mode");
  }
}

interface CompactScaleArgs {
  _0?: string;
  encode?: string;
  decode?: string;
  [key: string]: string | number | boolean | undefined;
}

export async function commandCompactScale(args: CompactScaleArgs) {
  const encodeValue = args.encode;
  const decodeHex = args.decode;

  if (encodeValue && decodeHex) {
    console.error("❌ Error: Cannot specify both --encode and --decode");
    console.log(
      "\nUsage: bun cli.ts compact-scale --encode <number> | --decode <hex>",
    );
    process.exit(1);
  }

  if (encodeValue) {
    // Encode a number to compact hex
    const num = parseInt(encodeValue, 10);
    if (isNaN(num)) {
      console.error("❌ Error: Invalid number for encoding");
      process.exit(1);
    }

    console.log(`Encoding number: ${num}`);

    try {
      const encoded = encodeCompact(num);
      const hex = Binary.fromBytes(encoded).asHex();

      console.log(`Compact encoded: ${hex}`);
      console.log(`Bytes used: ${encoded.length}`);
      console.log(`Encoding mode: ${encoded.length === 1 ? "single byte" : encoded.length === 2 ? "two bytes" : "four bytes"}`);

      // Show breakdown
      console.log("\nBreakdown:");
      for (let i = 0; i < encoded.length; i++) {
        console.log(`  Byte ${i}: 0x${encoded[i]!.toString(16).padStart(2, "0")} (${encoded[i]})`);
      }
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      process.exit(1);
    }
  } else if (decodeHex) {
    // Decode compact hex to number
    let hex = decodeHex;
    if (!hex.startsWith("0x")) {
      hex = "0x" + hex;
    }

    console.log(`Decoding compact hex: ${hex}`);

    try {
      const bytes = Binary.fromHex(hex).asBytes();
      const result = decodeCompact(bytes);

      console.log(`Decoded value: ${result.value}`);
      console.log(`Bytes consumed: ${result.bytesUsed}`);
      console.log(`Encoding mode: ${result.bytesUsed === 1 ? "single byte" : result.bytesUsed === 2 ? "two bytes" : "four bytes"}`);

      if (bytes.length > result.bytesUsed) {
        console.log(`\nWarning: ${bytes.length - result.bytesUsed} unused bytes in input`);
      }

      // Show breakdown
      console.log("\nBreakdown:");
      for (let i = 0; i < result.bytesUsed; i++) {
        console.log(`  Byte ${i}: 0x${bytes[i]!.toString(16).padStart(2, "0")} (${bytes[i]})`);
      }
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      process.exit(1);
    }
  } else {
    console.error("❌ Error: Must specify either --encode <number> or --decode <hex>");
    console.log(
      "\nUsage: bun cli.ts compact-scale --encode <number> | --decode <hex>",
    );
    console.log("\nExamples:");
    console.log("  bun cli.ts compact-scale --encode 42");
    console.log("  bun cli.ts compact-scale --decode 0xa8");
    process.exit(1);
  }
}
