# Tole Sudhar Samiti 360 — Shanti Tole

React application for one fictional neighborhood committee. Includes household/member registration, committee portraits, attendance/minutes, fee approval and reversals, complaints, projects, invitation cards and digital contribution passbooks.

## Status

**Database-backed DEMO, not a production identity system.** All role selection is simulated. Never enter actual private or financial data. No SMS/WhatsApp is sent. Public pages contain fictional information and AI-generated sample images.

- React + Vite, Cloudflare Worker API and D1.
- Each browser gets a random HttpOnly cookie and an isolated D1 workspace.
- `Random data ON` uses a reproducible seeded dataset (30 households, 100 members).
- `Random data OFF` opens a separate empty practice workspace. Switching preserves both workspaces; OFF does not enable production mode.
- Cookie lasts 7 days. Clearing cookies creates a new workspace; this is not account recovery.
- Server applies the reusable domain rules; revision comparisons prevent stale writes. Last 100 request IDs support idempotent retries.
- `DEMO_ENABLED=false` in Cloudflare configuration disables all demo state APIs.

## Local use

Node 22.18+ (Node 24 recommended):

```sh
npm ci
npm run dev
npm test
npm run build
```

Development uses isolated browser storage; deployed builds use D1. Server tests use Node's SQLite implementation and cover persistence, mode isolation, role checks, request replay and revision conflicts.

## Cloudflare deployment

`cloudflare.config.ts` identifies Worker `tsm` and binding `DB` (`tsm-demo-db`). Cloudflare CLI and Vite plugin beta versions are pinned because this configuration format uses the v2 plugin. Do not substitute the v1 plugin.

1. Import `globalgemss/tsm` into Cloudflare Workers Builds.
2. Build command: `npm run build`; deploy command: `npm run deploy`.
3. Node version: 24. Set the build account to the intended Cloudflare account.
4. Apply `migrations/0001_demo.sql` to the DB binding before first use. The initial hosted database was provisioned separately; a new account must create its own database and replace the ID in configuration.
5. Verify `/api/health`, then exercise ON/OFF and confirm a saved change survives reload.

```sh
npx cf auth login
npm run deploy
```

No credentials belong in Git. Database/account IDs are resource identifiers, not passwords.

## Production work remaining

Deploy real Auth (Supabase Auth + PostgreSQL/RLS was the original production direction) or a reviewed equivalent, replace demo role selection with server-verified memberships, introduce normalized tables and scoped reads, validate all domain fields, add rate limits and retention cleanup, secure uploads, backups and restore rehearsal. The present D1 JSON snapshots support the demo, not live committee accounting. Real communications and PDF generation beyond browser print are not integrated.

## Assets

`public/images/` contains all required AI-generated fictional community and portrait images. Portrait sheet is reused across demo members; these are not unique real identities. No remote image service is required.
