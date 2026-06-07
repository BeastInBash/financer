<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Financer — project context

Next.js 16 (App Router, Turbopack) + React 19 + Tailwind v4 + Clerk auth (`@clerk/nextjs` v7) + Prisma 7 (`@prisma/adapter-pg`) + TanStack Query v5 + Motion (`motion/react`) + `@imagekit/next` (receipt storage, planned). Package manager: bun.

## Known breaking changes (don't trust training data)
- **Middleware is `proxy.ts`** at the repo root (Next 16 renamed `middleware.ts` → `proxy.ts`). It runs `clerkMiddleware`; public routes are `/`, `/home`, `/sign-in(.*)`, `/api/webhooks(.*)`. Everything else calls `auth.protect()`, which redirects signed-out users to `/sign-in?redirect_url=...`.
- **Clerk `@clerk/nextjs` v7 dropped `<SignedIn>` / `<SignedOut>`.** Use the `<Show>` control component instead: `<Show when="signed-in" fallback={...}>...</Show>`. `when` also accepts `"signed-out"`, auth descriptors (`{ role: "admin" }`), or a `(has) => boolean` predicate.

## Routing & layout
- `app/page.tsx` — public landing page (client component). Navbar shows Sign in / Get started when signed out, and a **Dashboard** button + `UserButton` when signed in. "Explore the platform" links to `/dashboard`.
- `app/(front)/` — centered layout for auth pages (`sign-in` renders Clerk's `<SignIn />`).
- `app/dashboard/` — protected. `layout.tsx` renders `app/components/sidebar.tsx` + content; `page.tsx` is the dashboard (composed of `app/dashboard/_components/*`).
- `app/entry/` — protected. Same sidebar layout; `entry/new/page.tsx` is a **server component** that loads the signed-in user's real accounts/categories + currency from the DB (`force-dynamic`) and passes them to `new-entry-form.tsx`. Accounts/categories can be created inline from the form via `_components/inline-create.tsx` (`CreateAccountControl` / `CreateCategoryControl`), which POST to the accounts/categories APIs and `router.refresh()`. (`_components/`: `new-entry-form.tsx`, `inline-create.tsx`, `receipt-upload.tsx`.)
- **Route loading states.** Both protected routes are `force-dynamic` (per-user DB reads), so navigation into them blocks on the server fetch. Each has a Next App-Router `loading.tsx` that renders instantly inside the segment's sidebar `layout.tsx` and mirrors the real page chrome to avoid layout shift: `app/dashboard/loading.tsx` (topbar + KPI strip + analytics grid skeleton, plus a cycling terminal boot-status line) and `app/entry/new/loading.tsx` (the Transaction Detail form skeleton). The shared shimmer/scan-bar primitives live in **`app/components/skeleton.tsx`** (`Shimmer`, `ScanBar` — both `"use client"`, reduced-motion gated); reuse them for any new skeleton rather than re-rolling. To inspect a loading state, temporarily `await new Promise(r => setTimeout(r, 2000))` at the top of the route's `page.tsx`.
- Path alias: `@/*` → repo root (e.g. `@/app/components/sidebar`).

## Providers & data fetching
- **Root layout nesting** (`app/layout.tsx`): `<ClerkProvider>` (outermost) → `<Providers>` → `{children}`.
- **TanStack Query** (`@tanstack/react-query` v5) is wired via `app/providers.tsx` (a `"use client"` component). It uses the official App-Router SSR pattern: a fresh `QueryClient` per request on the server (`isServer`) and a browser singleton, held in `useState`. **Never** instantiate `QueryClient`/`QueryClientProvider` in the server root layout. Default `staleTime` is 60s. See `docs/tanstack-query-setup.md`.
- Client components use `useQuery`/`useMutation`; Server Components fetch directly via Prisma (e.g. `app/lib/dashboard/data.ts`).
- **Service layer** lives in `app/lib/services/*` (client-side `fetch` wrappers that React Query calls). `transactions.ts` exposes `createNewTransaction`, which throws a typed `TransactionRequestError` (carries HTTP status + server message) on failure.

## API routes & server auth
- `app/api/user/route.ts` — `GET` (lists users; scaffold).
- `app/api/webhooks/clerk/route.ts` — `POST`; verifies the signature with `verifyWebhook` from `@clerk/nextjs/webhooks` (needs `CLERK_WEBHOOK_SIGNING_SECRET`), then upserts/deletes the `User` row on `user.created/updated/deleted`. This is how Clerk users get mirrored into Postgres. Must stay public in `proxy.ts`.
- `app/api/transactions/route.ts` — `POST`; creates a transaction. **Contract:** plain `application/json` of `NewEntryPayload` (file stripped) plus a `receiptUrl: string | null`. The receipt is uploaded to ImageKit client-side first, so only its URL reaches this route.
- `app/api/imagekit/auth/route.ts` — `GET`; returns short-lived signed upload params (`token`, `signature`, `expire`, `publicKey`) via `getUploadAuthParams` from `@imagekit/next/server`. Authenticated. Needs env `IMAGEKIT_PUBLIC_KEY` + `IMAGEKIT_PRIVATE_KEY`.
- `app/api/accounts/route.ts` — `GET` (list user's accounts) + `POST` (create `{name, type, balance?, currency?}`). `app/api/categories/route.ts` — `GET` + `POST` (`{name, color?, icon?}`; returns 409 on the `userId_name` duplicate). Both go through `getDbUser`.
- **`getDbUser()`** (`app/lib/helper/auth.ts`) is the shared server helper for user-owned mutations: returns `{ clerkId, user }` so routes can return 401 (signed out) vs 409 (signed in, no DB row yet). Prefer it over re-deriving `clerkId → User.id` inline.
- **Server-side auth pattern:** import `auth` from **`@clerk/nextjs/server`** (not `@clerk/nextjs`), `const { userId } = await auth()` (it's async; `userId` is the Clerk id, null when signed out). `Transaction.userId` etc. store the **internal `User.id`**, so resolve `clerkId → User.id` via `prisma.user.findUnique({ where: { clerkId } })` before writing. Always verify referenced rows (account/category) belong to that user before mutating.

## Domain notes (transactions)
- **Transfers = two rows.** `Transaction` has a single `accountId` and no `toAccountId`, so a TRANSFER is persisted as an outflow row (source) + inflow row (destination), both `type: TRANSFER`, with balances moved on both accounts inside a `prisma.$transaction`. (Open: could become one row via a `toAccountId`/self-relation migration.)
- **Receipts → ImageKit (client-direct upload).** `new-entry-form.tsx` is wired via `useMutation(createNewTransaction)`. On submit the service (`app/lib/services/transactions.ts`) uploads the receipt browser→ImageKit using `upload()` from `@imagekit/next` (auth params from `/api/imagekit/auth`, folder `/financer/receipts`), then POSTs the transaction JSON with the resulting `receiptUrl`. The file never passes through our server. On success the form resets per-entry fields and calls `router.refresh()` to re-pull server-rendered dashboard data.
- `Tag.userId` and `RecurringRule.userId` are plain columns, not declared Prisma relations to `User` — tag upserts use the `userId_name` unique key.

## Prisma 7 specifics
- Config is `prisma.config.ts` (Prisma 7 no longer auto-loads `.env`; it imports `dotenv/config`). Run CLI as `bun --bun run prisma <cmd>` (e.g. `migrate dev`, `generate`).
- Client is generated to `app/generated/prisma/` (committed). Import the singleton `prisma` from `@/app/lib/db` (uses `@prisma/adapter-pg`); import enums/types from `@/app/generated/prisma/enums` / `@/app/generated/prisma/client`.
- Dashboard reads degrade gracefully: `getDashboardData()` falls back to `app/lib/dashboard/sample.ts` when there's no DB/user/data, so routes never 500 on transient data issues.
- `next.config.ts` lists an ngrok host in `allowedDevOrigins` — used to receive Clerk webhooks against local dev.

## Design system — "High-Density Precision" (see `Designs/DESIGN.md`)
Brutalist/minimal financial terminal aesthetic. **0px border-radius everywhere**, 1px solid borders (no shadows), Inter for headings, JetBrains Mono (`font-mono`) for all data/labels/timestamps. Tailwind theme tokens live in `app/globals.css`: `surface`, `surface-low`, `surface-container`, `on-surface`, `on-surface-variant`, `outline`, `outline-variant`, `ink`, `accent`, `on-accent`, `background` (white, used for cards). Note: `DESIGN.md` and the `Designs/*.png` mockups use Electric Blue as the accent, but the implemented `--color-accent` token is currently orange (`#ea580c`); use the `accent` token rather than hardcoding so a future swap is global.
