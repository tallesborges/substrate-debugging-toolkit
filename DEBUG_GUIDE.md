# Extrinsic Debugging Guide

This guide explains how to debug Polkadot/Substrate extrinsic issues, particularly SignedExtensions layout mismatches.

## Problem Summary

**Symptom**: Extrinsics panic when calling `TransactionPaymentApi_query_info` or `TransactionPaymentApi_query_fee_details` with error:
```
wasm trap: wasm `unreachable` instruction executed
```

**Root Cause**: SignedExtensions layout mismatch between when the extrinsic was encoded and the current runtime expectations.

## The Issue: TxExtension Layout Changes

### OLD Layout (before June 2024)
```
Era | Nonce | Tip | Call
```

### NEW Layout (current - with CheckMetadataHash added in June 2024)
```
Era | CheckMetadataHash | Nonce | Tip | Call
```

When the runtime tries to decode an old extrinsic, it reads the **Nonce byte** as the **CheckMetadataHash Option discriminant**, which must be `0x00` or `0x01`. Any other value (e.g., `0x04` for nonce=1) causes a panic.

## Using the Debug Tools

### 1. Decode and Inspect an Extrinsic

```typescript
import { decodeExtrinsic } from "./debug-extrinsics";

const extrinsic = "0x5102840090ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f...";
decodeExtrinsic(extrinsic, "My Test Extrinsic");
```

**Output shows**:
- Length, version, address, signature
- **Signed extensions breakdown** with interpretation
- **Warnings** if CheckMetadataHash byte is invalid (not 0x00 or 0x01)

### 2. Compare Two Extrinsics

```typescript
import { compareExtrinsics } from "./debug-extrinsics";

const oldExt = "0x5102840090ea..."; // Old layout
const newExt = "0x5102840090ea..."; // New layout

compareExtrinsics(oldExt, newExt, "OLD Layout", "NEW Layout");
```

**Output shows**:
- Byte-by-byte differences
- Signed extensions section comparison
- Where the layouts diverge

### 3. Build a Correct Extrinsic

```typescript
import { buildExtrinsic } from "./debug-extrinsics";

const extrinsic = buildExtrinsic({
  address: "0x90ea0c58aa1a2ed9db8bcb82f147f85dc0e1e56e7dd3ba87175df1577a4d636f",
  call: "0x0a0000eca95101fd1e74920abb30c45b491949aff430c7c3a332e5c6ac8ec23f6bb54d13000064a7b3b6e00d96000000",
  nonce: 0,
  tip: 0,
  era: "immortal", // or { period: 64, phase: 0 } for mortal
  checkMetadataHash: null, // null = None
});

console.log("Built extrinsic:", extrinsic);
```

### 4. Run Examples

```bash
bun run debug-extrinsics.ts
```

This will run examples showing:
- Decoding old vs new layout extrinsics
- Comparing them
- Building a new extrinsic from scratch

## Key Diagnostic Points

### Check Byte 102 (after 2-byte era) or 101 (after 1-byte era)

This should be the **CheckMetadataHash** byte:
- `0x00` = None (valid) ✓
- `0x01` = Some (valid, followed by 32 bytes) ✓
- **Anything else** = INVALID, will cause panic ✗

### Example: Old Layout Extrinsic

```
[100-101] Era: 0x1920 (mortal, 2 bytes)
[102] CheckMetadataHash: 0x04 ← INVALID! This is actually the nonce from old layout
```

**Result**: Runtime panics trying to decode `0x04` as an Option discriminant.

### Example: New Layout Extrinsic

```
[100-101] Era: 0x01f5 (mortal, 2 bytes)
[102] CheckMetadataHash: 0x00 ← Valid (None)
[103] Nonce: 0x00
[104] Tip: 0x00
[105+] Call: 0x0a0000...
```

**Result**: Decodes successfully ✓

## Common Issues

### Issue 1: All-Zero Signatures
**Symptom**: Extrinsic with signature `0x00000...` panics
**Cause**: Some signature types (Sr25519, Ed25519) reject all-zero signatures
**Fix**: Use a dummy pattern like all `0x01` bytes instead

### Issue 2: Wrong Era Size
**Symptom**: Call data appears shifted by 1 byte
**Cause**: Immortal era is 1 byte (`0x00`), mortal era is 2 bytes (e.g., `0x01f5`)
**Fix**: Ensure era encoding matches what the runtime expects

### Issue 3: Missing Call Data
**Symptom**: Extrinsic seems valid but still panics
**Cause**: Call data might be truncated or missing arguments
**Fix**: Compare with a working extrinsic's call data

## Matrix Chain Specific Notes

### Runtime Versions
- **Canary Matrix**: v1030 (deployed)
- **Matrix Blockchain**: v1022 (deployed)
- Both use the NEW TxExtension layout with `CheckMetadataHash`

### TxExtension Order
```rust
pub type TxExtension = (
    frame_system::CheckSpecVersion<Runtime>,        // No bytes (genesis hash)
    frame_system::CheckTxVersion<Runtime>,          // No bytes (genesis hash)
    frame_system::CheckGenesis<Runtime>,            // No bytes (genesis hash)
    frame_system::CheckEra<Runtime>,                // 1-2 bytes (immortal=1, mortal=2)
    frame_system::CheckWeight<Runtime>,             // No bytes
    frame_metadata_hash_extension::CheckMetadataHash<Runtime>, // 1 or 33 bytes
    pallet_fuel_tanks::CheckFuelTank<Runtime>,      // 0 bytes (PhantomData)
    pallet_fuel_tanks::CheckNonce<Runtime>,         // 1+ bytes (compact)
    pallet_transaction_payment::ChargeTransactionPayment<Runtime>, // 1+ bytes (compact)
);
```

## Migration Strategy

If you have old extrinsics that need to work:

### Option 1: Re-encode (Recommended)
Use `buildExtrinsic()` to create new extrinsics with the correct layout.

### Option 2: Runtime Compatibility Layer
Add backwards-compatible decoding in the runtime (complex, not recommended for fee queries).

### Option 3: Use Legacy RPCs
Use `payment_queryInfo` instead of `TransactionPaymentApi_query_info` (but this is deprecated and may be removed).

## References

- Polkadot SDK update that added CheckMetadataHash: `stable2506`
- Matrix Chain PR: BLOCK-2922 (June 2024)
- Substrate extrinsic format: https://docs.substrate.io/reference/transaction-format/

## Quick Checklist

When debugging extrinsic panics:

- [ ] Decode the extrinsic with `decodeExtrinsic()`
- [ ] Check if CheckMetadataHash byte is `0x00` or `0x01`
- [ ] Compare with a known working extrinsic
- [ ] Verify call data is complete and correct
- [ ] Check signature is not all zeros
- [ ] Rebuild extrinsic using `buildExtrinsic()` with current runtime layout
- [ ] Test with `TransactionPaymentApi_query_info`
