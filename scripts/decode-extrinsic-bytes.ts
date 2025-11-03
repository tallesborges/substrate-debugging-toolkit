/**
 * Decode Bytes Experiment
 * 
 * Raw byte-by-byte breakdown of extrinsics for low-level debugging
 */

import { Binary } from "polkadot-api";

const EXTRINSICS = [
  {
    name: "EXTRINSIC 1",
    hex: "0x5102840090ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000019200400000a0000eca95101fd1e74920abb30c45b491949aff430c7c3a332e5c6ac8ec23f6bb54d13000064a7b3b6e00d",
  },
  {
    name: "EXTRINSIC 2",
    hex: "0x5102840090ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010119200400000a0000eca95101fd1e74920abb30c45b491949aff430c7c3a332e5c6ac8ec23f6bb54d13000064a7b3b6e00d",
  },
  {
    name: "EXTRINSIC 3",
    hex: "0x5102840090ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f0101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101f5000000000a0000eca95101fd1e74920abb30c45b491949aff430c7c3a332e5c6ac8ec23f6bb54d13000064a7b3b6e00d96000000",
  },
  {
    name: "EXTRINSIC 4",
    hex: "0x5502840090ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000119200400000a0000eca95101fd1e74920abb30c45b491949aff430c7c3a332e5c6ac8ec23f6bb54d13000064a7b3b6e00d96000000",
  },
];

for (const ext of EXTRINSICS) {
  console.log(`\n${"=".repeat(80)}`);
  console.log(ext.name);
  console.log(`${"=".repeat(80)}`);
  
  const bytes = Binary.fromHex(ext.hex).asBytes();
  
  console.log("Total length:", bytes.length, "bytes");
  console.log("Length prefix:", bytes.slice(0, 2).toString());
  console.log("Version byte:", "0x" + bytes[2].toString(16).padStart(2, '0'));
  console.log("Address (32 bytes):", Binary.fromBytes(bytes.slice(3, 35)).asHex());
  console.log("Signature type:", "0x" + bytes[35].toString(16).padStart(2, '0'));
  console.log("Signature (64 bytes):", Binary.fromBytes(bytes.slice(36, 100)).asHex());
  console.log("\nSigned Extensions:");
  console.log(Binary.fromBytes(bytes.slice(100)).asHex());
  
  // Break down signed extensions
  const extBytes = bytes.slice(100);
  console.log("\nSigned Extensions breakdown:");
  let offset = 0;
  
  // Try to decode the compact length or first bytes
  for (let i = 0; i < Math.min(50, extBytes.length); i++) {
    if (i % 16 === 0) {
      console.log();
      console.log(`[${offset + i}]`.padStart(6), ":", Binary.fromBytes(extBytes.slice(i, i + 16)).asHex());
    }
  }
}
