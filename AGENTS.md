# AGENTS.md

Polkadot/Substrate extrinsics debugging toolkit.

## Commands

- **Run fee tests**: `bun run scripts/fees-matrix.ts`
- **Query fees**: `bun run scripts/query-fees.ts`
- **Build example**: `bun run scripts/build-extrinsic.ts`
- **Install**: `bun install`
- **Add chain**: `bunx papi add <chain> -n <name>`

## Structure

```
lib/extrinsic-utils.ts        # Utilities
scripts/                       # All scripts
```

## Utils (lib/extrinsic-utils.ts)

- `decodeExtrinsic(hex, name?)` - Decode and display extrinsic
- `compareExtrinsics(hex1, hex2, name1?, name2?)` - Compare two extrinsics
- `buildExtrinsic({ address, call, era?, nonce?, tip? })` - Build extrinsic

## Chains

- **canary-matrixchain**: `wss://rpc.matrix.canary.enjin.io`
- **matrix-blockchain**: `wss://rpc.matrix.blockchain.enjin.io`

## Code Style

- **TypeScript**: Strict mode enabled (`strict: true`)
- **Module system**: ESNext with bundler resolution
- **Imports**: Use `.ts` extensions allowed (`allowImportingTsExtensions: true`)
- **Unused variables**: Allowed (`noUnusedLocals: false`, `noUnusedParameters: false`)
- **Array access**: Requires undefined checks (`noUncheckedIndexedAccess: true`)
- **Target**: ESNext (latest JavaScript features)
- **No emit**: TypeScript for type checking only (`noEmit: true`)
