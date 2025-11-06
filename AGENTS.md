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

## Code Style

- **TypeScript**: Strict mode enabled (`strict: true`)
- **Module system**: ESNext with bundler resolution
- **Imports**: Use `.ts` extensions allowed (`allowImportingTsExtensions: true`)
- **Unused variables**: Allowed (`noUnusedLocals: false`, `noUnusedParameters: false`)
- **Array access**: Requires undefined checks (`noUncheckedIndexedAccess: true`)
- **Target**: ESNext (latest JavaScript features)
- **No emit**: TypeScript for type checking only (`noEmit: true`)
