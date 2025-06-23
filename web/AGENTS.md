# Flows Web — AGENTS.md

## 1. Repository map

| Path                      | What lives here                                                    | Edit?               |
| ------------------------- | ------------------------------------------------------------------ | ------------------- |
| `/app`                    | Route handlers, server & client components                         | ✅                  |
| `/components`             | Global UI components (ShadCN-based)                                | ✅                  |
| `/lib`                    | Server utilities, hooks, Prisma, on-chain helpers                  | ⚠️ run checks       |
| `/lib/database`           | Prisma schema (`flows.prisma`, `farcaster.prisma`) + typed queries | ⚠️ regen client     |
| `/public`                 | Static assets                                                      | ➕ add only         |
| `tailwind.config.ts`      | Tailwind & CVA design tokens                                       | ⚠️ keep conventions |
| `next.config.ts`          | Next.js build config                                               | ❌ ask first        |
| `.next/`, `node_modules/` | Build & vendor output                                              | 🚫 never touch      |

## 2. Coding conventions

### General Code Style

- Write concise, readable TypeScript code
- Use functional and declarative programming patterns; avoid classes
- Follow DRY (Don't Repeat Yourself) principle
- Implement early returns for better readability
- Use the "function" keyword for pure functions
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements

### Naming Conventions

- **Files & Directories**: Use lowercase with dashes (kebab-case)
  - Directories: `components/auth-wizard`
  - Files: `my-component.tsx`
- **Code Identifiers**:
  - PascalCase for classes and interfaces
  - camelCase for variables, functions, methods
  - UPPERCASE for environment variables and constants
  - Use descriptive names with auxiliary verbs for booleans: `isLoading`, `hasError`, `canDelete`
- Favor named exports
- Use complete words, avoiding unnecessary abbreviations (exceptions: API, URL, i/j for loops, err, ctx)

### TypeScript / React

- `tsconfig.json` has **`"strict": true`** – keep code type-safe
- Always declare explicit types for variables and functions
- Prefer interfaces over types
- Avoid enums; use const maps instead
- Avoid using "any" - create precise, descriptive types
- Follow best practices for React 19 and Next.js 15 (app folder)
- Favor React Server Components (RSC) where possible
- Client components must include `'use client'`
- Implement proper error boundaries
- Use Suspense for async operations
- For component props interface name use just "Props"

### Performance Optimization

- Minimize 'use client', 'useEffect', and 'setState' usage
- Use dynamic loading for non-critical components (next/dynamic)
- Optimize Web Vitals (LCP, CLS, FID)
- Use edge runtime where possible for better performance

### Async Request APIs

```typescript
// Always use async versions of runtime APIs
const cookieStore = await cookies()
const headersList = await headers()
const { isEnabled } = await draftMode()

// Handle async params in layouts/pages
const params = await props.params
const searchParams = await props.searchParams
```

### UI and Styling

- Use [Tailwind CSS](https://tailwindcss.com/) utility classes
- Use Shadcn UI, Radix, and Tailwind for components and styling
- Compose variants with [`class-variance-authority`](https://cva.style/)
- Implement responsive design with Tailwind CSS; use a mobile-first approach
- Use components from `web/components/ui` directory when possible
- Use Sonner for toast notifications
- Leverage Framer Motion for animations
- Configure Tailwind with:
  - tailwindcss-animate for animations
  - tailwind-merge for className merging
  - tailwind-scrollbar for custom scrollbars

### State Management & Data Fetching

- Use SWR as primary data fetching solution
- Implement optimistic updates where appropriate
- Use Zod for data validation and type safety
- Keep API routes in `app/api/` directory

### Database & Prisma

- Schema lives in `lib/database/flows.prisma` and `lib/database/farcaster.prisma`
- Project uses 2 Postgres databases:
  - Main database client exported in `flows-db.ts` (schema: `flows.prisma`)
  - Farcaster data in `farcaster-db.ts` (schema: `farcaster.prisma`)
- Main database contains views with blockchain data from Ponder (indexer)

#### Prisma Best Practices:

- Use type-safe Prisma client operations
- Handle optional relations explicitly
- Use select and include judiciously
- Avoid N+1 query problems
- Select only needed columns for performance
- Never expose raw Prisma client in APIs
- Import "server-only" package to ensure DB is not exposed to client
- Keep Prisma-related code in dedicated repositories/modules

After editing schema run:

```bash
pnpm db:generate  # regenerates all Prisma clients
```

### Authentication & Web3

- Use Privy for Web3 authentication (@privy-io/react-auth)
- Use server-side authentication checks
- Keep auth utilities in `lib/auth`
- Handle guest and authenticated states appropriately
- Use Viem 2.x for Ethereum interactions
- Implement Wagmi 2.x hooks for contract state
- Keep blockchain-related logic in dedicated hooks/utilities
- Handle wallet connections via Privy
- Store contract-related constants in dedicated files

### Function Guidelines

- Write concise, single-purpose functions (aim for <20-30 lines)
- Name functions descriptively with a verb
- Use early returns to minimize complexity
- Extract complex logic to utility functions
- Leverage functional programming techniques (map, filter, reduce)
- Use object parameters for multiple arguments
- Maintain a single level of abstraction

### Code Quality Principles

- Follow SOLID principles
- Prefer composition over inheritance
- Write clean, readable, and maintainable code
- Continuously refactor and improve code structure
- Try to limit installing new packages when it makes sense to add code directly

### Prettier / ESLint

- Run `pnpm lint` before committing – the project uses Next.js ESLint rules
- Prettier with the Tailwind plugin formats code automatically; keep line length ≤ 100 chars

## 3. Required commands

```bash
# Lint & type-check
pnpm lint && pnpm typecheck

# After Prisma schema changes
pnpm db:generate

# Build verification
pnpm build
```

Agents **must** re-run the full command stack above before pushing changes.

## 4. Pull-request checklist

1. All commands in section 3 pass locally
2. PR title follows Conventional Commits (`feat:`, `fix:`, `chore:`…)
3. Include a concise description and, if applicable, "Closes #<issue>"
4. Screenshots/GIFs for any visual change in `/app` or `/components`

## 5. Programmatic checks

- All modified files pass `pnpm lint` **and** `pnpm typecheck`
- If any `lib/database/*.prisma` file changes, run `pnpm db:generate` and include the generated client in the commit
- Run `pnpm build` to ensure the production bundle compiles
- Verify no "any" types are introduced
- Check that new client components include 'use client' directive
- Ensure database queries use proper Prisma patterns (no N+1 queries)

## 6. Safety / limits

- **NEVER** commit `.env`, database dumps, or any secrets
- Do **NOT** push changes to `.next/`, `node_modules/`, or other generated artifacts
- Ask for review before upgrading major dependencies or modifying deployment configs (`vercel.json`, `next.config.ts`)
- External network calls during CI are forbidden
- Never expose raw Prisma client in APIs
- Always validate and sanitize user inputs
- Use Prisma's built-in SQL injection protections

## 7. Platform Context (Flows)

Flows is a decentralized grant program providing continuous funding through streaming payments:

- Grants organized into categories called "flows"
- Recipients receive streaming payments every second based on performance
- Deep integration with Farcaster for social engagement
- Community voting affects grant funding rates
- Maximum 2 active grants per user
- Built on blockchain for transparent fund distribution

---

### Meta-instructions for downstream agents

1. Follow the precedence rules: this file governs the entire `/web` package. No other `AGENTS.md` currently overrides it
2. When updating Section 3 with new scripts, append rather than replace existing ones
3. Always consider the full context of TypeScript, React, Next.js, and Prisma best practices
4. Maintain consistency with the established patterns in the codebase

Happy streaming 🚀
