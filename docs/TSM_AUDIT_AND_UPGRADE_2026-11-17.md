# TSM repository audit & staged implementation — 2026-11-17

## Inspected baseline
- `main` app is **tole360 v10.0.0**, React 19, Vite 7.3.8; Cloudflare Vite plugin and `cf` CLI are pinned.
- `cloudflare.config.ts`: Worker `tsm`, D1 binding `DB` to **demo** database, static asset routing; `DEMO_ENABLED` is true.
- `server/worker.js`: `/api/health`, `/api/state`, `/api/command`, `/api/reset`; cookie-isolated demo workspaces, optimistic revision, idempotent command keys.
- `src/main.jsx`: navigation for households, members, committee, meetings, finance, issues, projects, messages, invitations, passbook, member portal.
- `src/Website.jsx`: public site, header, sections, and clearly labeled **role-simulation demo login**.
- `src/CommunityTools.jsx`: browser-print passbooks and invitation preview/export.
- `migrations/0001_demo.sql`: JSON demo workspaces, **not** a normalized live ledger.

## Audit findings / blockers
1. **CRITICAL** Role selection in browser is a demo simulation. Never use with real KYC, household or finance data. Must add real verified identity, membership and per-tenant authorization on **all** reads and writes.
2. **CRITICAL** D1 demo records are whole-workspace JSON. Keep those untouched; live data needs normalized tables, secure user/household associations, atomic financial writes, audit and recovery.
3. **HIGH** Public gallery and sample portraits are fictional. Before release, use consented real images; avoid posting private member images or KYC.
4. **HIGH** Production backup/restore, data-retention, upload controls, notification consents and rate limits are not proven.
5. **MEDIUM** Mobile UX/accessibility, full CRUD QA and file export should be verified on real devices.
6. **MEDIUM** Deployment must be staged. GitHub branch/PR does not prove Cloudflare build or runtime success.

## Changes in this branch
- Added HTTP API response hardening: no-store/private, anti-sniffing, clickjacking protection, privacy headers and a restrictive **API-only** CSP.
- Added Node tests for key API safety boundaries.
- Added a **DRAFT** normalized production schema at `migrations/production/0001_core_schema_DRAFT.sql`. It has **not** been applied to any database.
- Existing demo UI, D1 data, routes and the main branch remain unchanged.

## Recommended implementation sequence
1. **Foundation & security**: choose production auth, authenticated membership lookup, per-request committee scoping; add default-deny permissions and automated cross-tenant tests. D1 itself does **not** provide PostgreSQL RLS. If adopting Supabase PostgreSQL, implement and test real RLS policies instead of deploying this D1 SQL.
2. **Member/household**: migrate to normalized household/member tables; consented KYC with masked identifiers, restricted access, QR codes containing opaque IDs only, not personal data; digital passbook from approved ledger.
3. **Committee**: meeting creation, agenda, attendance present/absent/late, quorum, immutable minutes approvals, invitations with print/export and optional consented messaging.
4. **Finance & projects**: ledger entries in paisa, server-side approval, idempotency, reversal instead of deletion, audit events, project budget/progress and public aggregated summaries.
5. **Premium design**: maintain current palette, responsive header/hero/navigation, cards, loading states, accessible gallery and keyboard navigation, reduced-motion transitions. Verify every page in mobile and desktop.
6. **Deployment**: isolated staging DB & worker; `npm ci && npm test && npm run build`; review environment bindings and permissions; backup test, smoke test, then separately approve production rollout.

## Release checklist
- [ ] Authentication provider & secure sessions implemented, verified, and tested
- [ ] User-to-committee roles validated on server (not client role dropdown)
- [ ] Cross-tenant unauthorized reads/writes tested
- [ ] No actual member KYC or payments in demo D1 workspace
- [ ] Migration applied **only** to staging DB after review; backout procedure verified
- [ ] API rate limiting, audit, backup, restore and retention verified
- [ ] Gallery, profile photos and public notices have consent and privacy review
- [ ] Test + build pass; staged Cloudflare smoke test passes
- [ ] Explicit approval before deploying production

**Never merge this branch automatically or execute DRAFT SQL against the existing demo DB.**
