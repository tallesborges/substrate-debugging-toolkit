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
- **Query fees**: `bun cli.ts query-fees --address <hex> --call <hex> [--chain <name>]`
- **Query extrinsic fees**: `bun cli.ts query-extrinsic-fees <extrinsic-hex> [--chain <name>]`
- **Compact SCALE**: `bun cli.ts compact-scale --encode <number> | --decode <hex>`
- **Get storage**: `bun cli.ts get-storage <key> [block] [--chain <name>]`
- **Get block**: `bun cli.ts get-block [--hash <hash>] [--chain <name>]`
- **List pallets**: `bun cli.ts list-pallets [--chain <name>]`
- **List calls**: `bun cli.ts list-calls [--chain <name>] [--pallets <comma-separated>]`
- **List types**: `bun cli.ts list-types [--chain <name>]`
- **Describe type**: `bun cli.ts describe-type <type-name> [--chain <name>]`
- **List constants**: `bun cli.ts list-constants [--chain <name>] [--pallet <name>]`
- **Describe constant**: `bun cli.ts describe-constant <pallet> <constant> [--chain <name>]`
- **Add chain**: `bun cli.ts add-chain --name <name> --ws-url <url> [--display-name <name>] [--papi-key <key>] [--set-default]`

## Setup

- **Install**: `bun install`
- **Add chain**: `bunx papi add <chain> -n <name>`

## Structure

```
cli.ts                         # Main CLI entry point
lib/extrinsic-utils.ts         # Core utilities
commands/                      # Custom executable commands
```

## Utils (lib/extrinsic-utils.ts)

- `decodeExtrinsic(hex, name?)` - Decode and display extrinsic
- `compareExtrinsics(hex1, hex2, name1?, name2?)` - Compare two extrinsics
- `buildExtrinsic({ address, call, era?, nonce?, tip? })` - Build extrinsic

## Chains

Chains are configured in `chains.json` in the project root.

To add a new chain, use the `add-chain` command:
```bash
bun cli.ts add-chain --name <name> --ws-url <url> [--display-name <name>] [--papi-key <key>] [--set-default]
```

This automatically updates both `.papi/polkadot-api.json` and `chains.json`.

## Storage Keys

Quick lookup for common storage keys:

- **COLLECTIONS**: `0xfa7484c926e764ee2a64df96876c81459200647b8c99af7b8b52752114831bdb`
- **PENDING_COLLECTION_TRANSFERS**: `0xfa7484c926e764ee2a64df96876c8145ec71cb5fb8f048d4d001b5efa87fcf5b`
- **COLLECTION_ACCOUNTS**: `0xfa7484c926e764ee2a64df96876c814555aac77eef55f610e609e395282fe9a2`
- **TOKENS**: `0xfa7484c926e764ee2a64df96876c814599971b5749ac43e0235e41b0d3786918`
- **TOKEN_ACCOUNTS**: `0xfa7484c926e764ee2a64df96876c8145091ba7dd8dcd80d727d06b71fe08a103`
- **ATTRIBUTES**: `0xfa7484c926e764ee2a64df96876c8145761e97790c81676703ce25cc0ffeb377`
- **EVENTS**: `0x26aa394eea5630e07c48ae0c9558cef780d41e5e16056765bc8461851072c9d7`
- **SYSTEM_ACCOUNT**: `0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9`
- **TANKS**: `0xb8ed204d2f9b209f43a0487b80cceca11dff2785cc2c6efead5657dc32a2065e`
- **ACCOUNTS**: `0xb8ed204d2f9b209f43a0487b80cceca18ee7418a6531173d60d1f6a82d8f4d51`
- **LISTINGS**: `0xb8f32c9f36429933d924999a1b87423f202053cada0eb576e7ccf72ebc965b05`

## Code Style

- **TypeScript**: Strict mode enabled (`strict: true`)
- **Module system**: ESNext with bundler resolution
- **Imports**: Use `.ts` extensions allowed (`allowImportingTsExtensions: true`)
- **Unused variables**: Allowed (`noUnusedLocals: false`, `noUnusedParameters: false`)
- **Array access**: Requires undefined checks (`noUncheckedIndexedAccess: true`)
- **Target**: ESNext (latest JavaScript features)
- **No emit**: TypeScript for type checking only (`noEmit: true`)
