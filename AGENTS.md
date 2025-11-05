# AGENTS.md

Polkadot/Substrate extrinsics debugging toolkit.

## Important Note for AI Agents

**⚠️ ALWAYS UPDATE THIS FILE** when adding or modifying CLI commands, utilities, or project structure.

## CLI Usage

The project includes a comprehensive CLI tool for all extrinsic operations:

- **Show help**: `bun cli.ts help`
- **Build extrinsic**: `bun cli.ts build --address <hex> --call <hex> [--nonce <n>] [--tip <n>] [--era immortal|mortal] [--decode]`
- **Decode extrinsic**: `bun cli.ts decode <extrinsic-hex> [--name <string>]`
- **Compare extrinsics**: `bun cli.ts compare <hex1> <hex2> [--name1 <s>] [--name2 <s>]`
- **Query fees**: `bun cli.ts query-fees --address <hex> --call <hex> [--chain canary|matrix]`
- **Query extrinsic fees**: `bun cli.ts query-extrinsic-fees <extrinsic-hex> [--chain canary|matrix]`
- **Compact SCALE**: `bun cli.ts compact-scale --encode <number> | --decode <hex>`
- **Get storage**: `bun cli.ts get-storage <key> [block] [--chain canary|matrix]`
- **Get block**: `bun cli.ts get-block [--hash <hash>] [--chain canary|matrix]`
- **List pallets**: `bun cli.ts list-pallets [--chain canary|matrix]`
- **List calls**: `bun cli.ts list-calls [--chain canary|matrix] [--pallets <comma-separated>]`
- **List types**: `bun cli.ts list-types [--chain canary|matrix]`
- **Describe type**: `bun cli.ts describe-type <type-name> [--chain canary|matrix]`

## Legacy Script Commands

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
