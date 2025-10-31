# AGENTS.md

## Commands

- **Run**: `bun run index.ts`
- **Install dependencies**: `bun install`
- **Type check**: `bun tsc --noEmit` (if needed)
- **Add chain metadata**: `bunx papi add <key> -w <ws_url>` (for custom chains) or `bunx papi add <chain> -n <name>` (for well-known chains)
- **Update metadata**: `bunx papi update`

## Architecture

- Simple Bun + TypeScript project
- Entry point: `index.ts`
- No tests, build scripts, or linting currently configured
- Uses Bun runtime (not Node.js)

## Code Style

- **TypeScript**: Strict mode enabled (`strict: true`)
- **Module system**: ESNext with bundler resolution
- **Imports**: Use `.ts` extensions allowed (`allowImportingTsExtensions: true`)
- **Unused variables**: Allowed (`noUnusedLocals: false`, `noUnusedParameters: false`)
- **Array access**: Requires undefined checks (`noUncheckedIndexedAccess: true`)
- **Target**: ESNext (latest JavaScript features)
- **No emit**: TypeScript for type checking only (`noEmit: true`)
