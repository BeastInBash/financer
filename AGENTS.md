<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Financer — project context

Next.js 16 (App Router, Turbopack) + React 19 + Tailwind v4 + Clerk auth + Prisma (pg). Package manager: bun.

## Known breaking changes (don't trust training data)
- **Middleware is `proxy.ts`** at the repo root (Next 16 renamed `middleware.ts` → `proxy.ts`). It runs `clerkMiddleware`; public routes are `/`, `/home`, `/sign-in(.*)`, `/api/webhooks(.*)`. Everything else calls `auth.protect()`, which redirects signed-out users to `/sign-in?redirect_url=...`.
- **Clerk `@clerk/nextjs` v7 dropped `<SignedIn>` / `<SignedOut>`.** Use the `<Show>` control component instead: `<Show when="signed-in" fallback={...}>...</Show>`. `when` also accepts `"signed-out"`, auth descriptors (`{ role: "admin" }`), or a `(has) => boolean` predicate.

## Routing & layout
- `app/page.tsx` — public landing page (client component). Navbar shows Sign in / Get started when signed out, and a **Dashboard** button + `UserButton` when signed in. "Explore the platform" links to `/dashboard`.
- `app/(front)/` — centered layout for auth pages (`sign-in`).
- `app/dashboard/` — protected. `layout.tsx` renders `app/components/sidebar.tsx` + content; `page.tsx` is the dashboard.
- Path alias: `@/*` → repo root (e.g. `@/app/components/sidebar`).

## Design system — "High-Density Precision" (see `Designs/DESIGN.md`)
Brutalist/minimal financial terminal aesthetic. **0px border-radius everywhere**, 1px solid borders (no shadows), Inter for headings, JetBrains Mono (`font-mono`) for all data/labels/timestamps. Tailwind theme tokens live in `app/globals.css`: `surface`, `surface-low`, `surface-container`, `on-surface`, `on-surface-variant`, `outline`, `outline-variant`, `ink`, `accent`, `on-accent`, `background` (white, used for cards). Note: `DESIGN.md` and the `Designs/*.png` mockups use Electric Blue as the accent, but the implemented `--color-accent` token is currently orange (`#ea580c`); use the `accent` token rather than hardcoding so a future swap is global.
