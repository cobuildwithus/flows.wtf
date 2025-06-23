# Flows Indexer — AGENTS.md

This file governs the behavior of AI coding agents working **inside the `/indexer` service** of the Flows monorepo. The indexer is a **Ponder-based blockchain indexer** that processes on-chain events and serves data via GraphQL API.

## 1. Repository map

| Path                | What lives here                             | Edit?             |
| ------------------- | ------------------------------------------- | ----------------- |
| `/src`              | Event handlers, API routes, utilities       | ✅                |
| `/src/tcr`          | TCR (Token Curated Registry) event handlers | ✅                |
| `/src/grants`       | Grant-related event handlers and logic      | ✅                |
| `/src/flows`        | Flow contract event handlers                | ✅                |
| `/src/dispute`      | Dispute mechanism handlers                  | ✅                |
| `/src/api`          | Ponder API endpoints                        | ✅                |
| `/abis.ts`          | Contract ABIs (auto-generated)              | ❌ generated      |
| `/ponder.config.ts` | Ponder configuration (contracts, chains)    | ⚠️ review changes |
| `/ponder.schema.ts` | Database schema for indexed data            | ⚠️ run codegen    |
| `/generated`        | Generated TypeScript types                  | 🚫 never touch    |
| `/node_modules`     | Dependencies                                | 🚫 never touch    |

## 2. Coding conventions

### General Code Style

- Write concise, readable TypeScript code
- Use functional and declarative programming patterns; avoid classes
- Follow DRY (Don't Repeat Yourself) principle
- Implement early returns for better readability
- Use the "function" keyword for pure functions
- Type: `"module"` (ES modules)
- Target: Node.js 18+

### Naming Conventions

- **Files & Directories**: Use lowercase with dashes (kebab-case)
  - Event handlers: `token-transfer.ts`, `flow-initialized.ts`
  - Utilities: `hash-utils.ts`, `validation-helpers.ts`
- **Functions & Variables**:
  - camelCase for functions and variables
  - Use descriptive names with auxiliary verbs for booleans: `isActive`, `hasVoted`
  - Event handler names should match contract events
- Favor named exports

### TypeScript Usage

- Strict mode TypeScript - keep code type-safe
- Always declare explicit types for event handlers
- Use Ponder's generated types from schema
- Avoid using "any" - use proper event and entity types
- Leverage type inference where appropriate

### Ponder-Specific Patterns

- Keep event handlers pure and focused on single responsibility
- Use context methods (`context.db`, `context.client`) properly
- Handle reorgs gracefully - all operations should be idempotent
- Optimize database queries - avoid N+1 patterns
- Use batch operations where possible

### Performance Considerations

- Minimize RPC calls - use indexed event data when possible
- Batch database operations using Ponder's bulk methods
- Keep event handlers lightweight
- Use appropriate database indexes (defined in schema)

### Error Handling

- Always handle potential null/undefined values
- Log errors with meaningful context
- Don't throw in event handlers - return early on errors
- Use try-catch for external calls (RPC, API)

## 3. Required commands

```bash
# Development (with hot reload)
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Generate types from schema
pnpm codegen

# Production start
pnpm start
```

Agents **must** run lint and typecheck before pushing changes.

## 4. Pull-request checklist

1. All commands in section 3 pass locally
2. If `ponder.schema.ts` is modified, run `pnpm codegen` and commit generated types
3. If adding new contracts to `ponder.config.ts`, ensure proper startBlock is set
4. Test event handlers with real on-chain data locally
5. PR title follows Conventional Commits (`feat:`, `fix:`, `chore:`)
6. Include description of indexed events/contracts if adding new ones

## 5. Programmatic checks

- All modified files pass `pnpm lint` and `pnpm typecheck`
- If `ponder.schema.ts` changes, `pnpm codegen` must be run
- Event handlers must be idempotent (safe for reorgs)
- No direct database queries - use Ponder's context.db methods
- Verify new event handlers are registered in appropriate index files

## 6. Safety / limits

- **NEVER** commit `.env` files or expose RPC URLs
- Do **NOT** commit to `/generated` or `/node_modules`
- No hardcoded private keys or sensitive data
- Event handlers must not make external HTTP calls (except via context.client)
- Be mindful of RPC rate limits - batch calls when possible
- Ask for review before:
  - Adding new chains or RPC providers
  - Modifying core configuration files
  - Changing deployment infrastructure

## 7. Ponder Architecture Context

The indexer uses Ponder v0.11+ which provides:

- Automatic reorg handling
- GraphQL API generation
- Type-safe database operations
- Multi-chain indexing support

Key contracts indexed:

- **NounsFlow**: Main flow contract for grant distribution
- **FlowTCR**: Token Curated Registry for grant curation
- **CustomFlow**: Custom flow implementations
- **Arbitrator**: Dispute resolution contracts
- **TokenEmitter**: Token distribution contracts
- **ERC721 tokens**: NFT contracts (Nouns, VRBS, Gnars, Grounds)

Data flows to:

- PostgreSQL database (shared with web app)
- API endpoints for frontend consumption
- Queue system for async processing

---

### Meta-instructions for downstream agents

1. This file overrides general rules from repo-root for the `/indexer` package
2. When modifying the schema, always regenerate types before committing
3. Follow Ponder best practices for event handler implementation
4. Maintain consistency with contract event names and handler names

Happy indexing 🚀
