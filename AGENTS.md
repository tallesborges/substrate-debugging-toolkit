# AGENTS.md

## Commands

- **Run**: `bun run index.ts`
- **Debug extrinsics**: `bun run debug-extrinsics.ts`
- **Install dependencies**: `bun install`
- **Type check**: `bun tsc --noEmit` (if needed)
- **Add chain metadata**: `bunx papi add <key> -w <ws_url>` (for custom chains) or `bunx papi add <chain> -n <name>` (for well-known chains)
- **Update metadata**: `bunx papi update`

## Architecture

- Simple Bun + TypeScript project
- Entry point: `index.ts`
- Debugging utilities: `debug-extrinsics.ts`
- Documentation: `DEBUG_GUIDE.md` - comprehensive debugging guide
- No tests, build scripts, or linting currently configured
- Uses Bun runtime (not Node.js)

## Debugging Files

### debug-extrinsics.ts
Utility functions for analyzing and debugging extrinsics:
- `decodeExtrinsic(hexString, name?)` - Decode and display extrinsic structure byte-by-byte
- `compareExtrinsics(hex1, hex2, name1?, name2?)` - Compare two extrinsics to find differences
- `buildExtrinsic(components)` - Build properly formatted extrinsics with correct TxExtension layout

Run standalone examples: `bun run debug-extrinsics.ts`

### DEBUG_GUIDE.md
Complete documentation covering SignedExtensions layout mismatch issues, OLD vs NEW layout differences, debugging instructions, common issues, and Matrix Chain specifics. Consult when extrinsics panic with `wasm unreachable` errors.

## Code Style

- **TypeScript**: Strict mode enabled (`strict: true`)
- **Module system**: ESNext with bundler resolution
- **Imports**: Use `.ts` extensions allowed (`allowImportingTsExtensions: true`)
- **Unused variables**: Allowed (`noUnusedLocals: false`, `noUnusedParameters: false`)
- **Array access**: Requires undefined checks (`noUncheckedIndexedAccess: true`)
- **Target**: ESNext (latest JavaScript features)
- **No emit**: TypeScript for type checking only (`noEmit: true`)
