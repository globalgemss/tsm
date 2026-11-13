# V10 Cloudflare D1 demo

Random data ON and OFF use separate browser-isolated D1 workspaces. OFF is an empty practice workspace, not production mode. Role selection is simulated. No real private data. See README.md in https://github.com/globalgemss/tsm for deployment and remaining production requirements.

# V6 — Invitations, contribution passbook and development showcase

Added four invitation styles, meeting-derived title/date/place, recipient personalization, editable preview time/message, browser Print/Save PDF and simplified SVG image download. Invitation preview links to the exact meeting attendance. These are invitation styles, not separate event registration workflows. Preview edits are transient. SVG is a simplified export, not pixel-identical to the HTML card.

Added household contribution passbook with cover, fee-period totals, approved receipts, pending transactions and retained corrections. Scope follows existing role-filtered inputs. No banking or savings functionality. PDF uses the browser print dialog; print layout is included but exported PDFs were not visually verified in this turn.

Added fictional road-completion and lighting-progress projects to the single committee, preserving existing records. All illustrations remain clearly marked as samples; Before/After photo management, independent event attendance, persistent invitation drafts and real messaging remain unimplemented.

38 automated checks passed. Desktop browser verified passbook totals, invitation preview and linked attendance modal. Real authentication and physical mobile-device QA remain pending.

# V5 — Single committee edition

Current scope supersedes the earlier multi-committee design below. The website and dashboard show only fictional Shanti Tole Sudhar Samiti: 30 households and 100 members. No directory or tenant selector is presented. Legacy tenant routes resolve to this committee. A separate browser storage key preserves prior demo data without mixing it into this edition. All resets and dataset downloads contain only this committee.

Login remains explicitly simulated; it is not production authentication. Real committee name, contacts, consented photos, Supabase Auth and server-side controls remain pending.

Validation: 35 automated tests passed, including fixed-community routes, dataset isolation and adapter rejection of other tenants. Desktop homepage and Login-to-member-portal verified. Physical mobile-device QA remains pending.

## Earlier implementation notes (historical multi-committee scope)

# Tole Sudhar Samiti 360 — Royal Premium Demo v2

Independent React + Vite application. No code, database or deployment from the women's group project was used or changed.

## Run

Node.js 20+ recommended. Run `npm ci`, `npm run dev`. Run `npm test` for domain checks and `npm run build` for production static assets. The source ZIP includes the fictional dataset, test output and this implementation inventory.

## Module map and data model

Hierarchy: one fictional municipality → 3 wards → 12 committees → 360 households → 1,200 adult fictional members. Each tenant has 30 households / 100 members. Household means an occupying family, not a physical building; two independent households can share one house number. Households retain an append-only history when moved out. A replacement family is registered as a separate household at the same house number; old records are retained.

- `households`: tenant, ward, house number, family name, residence type, street, active flag, history.
- `members`: household, fictional name, age, skill, optional phone / identifier, communication consent, public consent, membership flag.
- `fees`: household, period, kind, integer-paisa amount; unique combination prevents repeated assessment.
- `transactions`: receipt ID, fee/household, signed direction, channel, amount, approval status, separate creator/approver, reversal reference.
- `meetings`: eligible member IDs, explicit person-based quorum, attendance, locked flag, draft/review/approved minutes, tasks with assignee/deadline/evidence.
- `issues`: owner, privacy classification, status, assignee, deadline, resolution evidence.
- `projects`: estimated budget, progress and narrative report.
- `messages`: consent-filtered recipient count, fingerprint, simulated outcome, attempt count.
- `audit`: actor, action, reason, time; record version and request keys support simulation checks.

`src/domain.js` is a pure simulation domain layer. `src/adapter.js` is the isolated browser persistence adapter. Neither has a database or messaging provider. Role selectors are simulation controls, NOT authentication. Anyone who opens the demo can switch roles and inspect its entirely fictional data. Client-side restrictions are NOT security boundaries.

## Working workflows

Household and member creation; possible duplicate review by exact name/shared phone with reason; optional unique identity collision prevention; retained move-out history; per-household monthly/service/special fee generation; partial payment; expense entry; separate approval/rejection; approved-only balance; reversal without deleting originals; printable receipts and cards; search and pagination; household type filtering; member renewal filter; meeting creation, attendance Mark All/individual, locking/reopening, quorum checks, minutes approval, responsibilities and completion evidence; issue registration and six-stage resolution; project proposal/progress; communication preview/confirmation, simulated failure/retry and duplicate prevention; household portal; consent-filtered public committee layout; public aggregate balance; ward aggregate view; simulation reset, seed, results and dataset download.

All default dates represent a fixed fictional November 2026 scenario. Totals are computed from records. `remaining(..., true)` reserves pending income so a pending payment cannot be collected again. Pending reversals do not reopen the payable balance until approved. An approved reversal reopens the original fee balance.

## Demo policy defaults (not legal rules)

Secretary manages people/meetings/messages; treasurer enters finances; chair approves transactions/minutes; committee members manage public issues/projects; household/member roles see their own personal record and household financial records and may register issues. Ward Viewer sees aggregate ward data. System Admin exercises all actions in the selected tenant, but still cannot approve its own financial entry. Each role represents a separate fictional actor. Quorum defaults to 5 of 7 named eligible people and can be specified at meeting creation. Household voting, delegated voting and legislative percentages are not assumed.

## Partial / remaining scope

- People: exact duplicate matching only (fuzzy similarity pending); no full profile edit/renewal, family relationships, owner entity, DOB/photo/map upload, historical membership and detailed consent revocation UI.
- Committee: consent-filtered visual layout only; full election, appointment, term and handover records pending.
- Meetings: explicit seven-person roster; arbitrary roster selection, household voting and invitation document templates pending.
- Finances: household charges only; annual/member fee rules, grants/donations, cash/bank reconciliation, period reports, project allocations, approval thresholds and account closing pending.
- Issues: text evidence only; categories/priority, photos/map locations and assignee directory pending.
- Projects/events: estimated budget/progress only; approved budget workflow, actual spend linkage, before/after photos, event registration, attendance, volunteers and labour contributions pending.
- Documents: print CSS + browser Save as PDF for cards, receipts and minutes; not a dedicated PDF engine. Invitation, appreciation, annual/project report templates and actual QR verification pending. No decorative QR is shown as verified.
- Communication: all-consented or household selection; committee/area/custom-member recipient groups, provider webhooks and per-recipient delivery logs pending.
- UI: responsive CSS implemented; desktop browser reviewed. Mobile device and print PDF rendering not independently verified. Member/household card/table toggle and name/ID sorting implemented in v2; desktop browser checked. Mobile bottom navigation added, but physical-device QA remains pending.
- Infrastructure: no real auth, server authorization, database, production audit immutability, provider sending or backup/restore. Local storage is not secure storage. Cross-tab revision checks are best-effort; atomic multi-device concurrency is not implemented.

## Verification

24 executable domain checks pass, 0 fail; 8 production/extended feature categories explicitly labelled Not implemented. See `public/simulation-results.json`. These checks verify selected simulation rules, not every requirement or a security audit. Desktop browser checks: dashboard loads, meeting opens, Mark All updates attendance, attendance locks, minutes save/review/approval works, simulation renders 24 Pass / 0 Fail / 8 Not implemented. Test records stay in that browser only; a new browser starts with clean seed.

## Production roadmap

1. Approve bylaws: voting unit and eligible roster, quorum, signatories/approval thresholds, role-specific personal-data needs and consent/retention policy. Finish remaining people, committee, events and reporting workflows in simulation.
2. Establish separate staging project and normalized SQL tables for municipality/ward/tenant/building/household/occupancy/member/consent/roles. Migrate only validated fictional seed initially.
3. Add Supabase Auth and server-issued user/tenant memberships. Apply RLS to every private table, views and storage bucket. Ward access must use explicit tenant grants; household representatives get household billing scope, not others' sensitive personal rows. Public data comes from narrowly projected consent-aware views.
4. Move all mutation authorization/validation to server transactions. Use BIGINT paisa, unique fee-period constraints, unique receipt/request keys, row versions/locking and separate creator/approver checks. Reverse approved ledger entries rather than deleting them. Audit actor IDs and old/new values on the server.
5. Add private media storage, consent-gated optional locations, signed access, verified document routes. Add outbox workers and SMS/WhatsApp providers only after consent, credentials, spending limits, provider delivery callbacks and idempotent retries are tested. Secrets remain server-side; never in URL/query strings or plaintext PIN fields.
6. Set retention and backup policy: daily encrypted database backup, independent media copy, restricted access, retention schedule, periodic staging restore drill and documented RPO/RTO agreed by committee. Validate migrations, RLS negative tests and recovery before production data import.
7. Pilot with one committee, reconcile receipts with bank/cash, test phone/mobile/print/accessibility and train role holders. Then expand tenant-by-tenant with monitored rollback and incident procedures.

## Royal v2 UI update

Uses the user's Jorpati Women’s Group Admin Dashboard image as visual reference: deep maroon sidebar, blush headers, teal actions, white forms and restrained gold details. No code or deployment of that project was modified. Added dashboard quick actions, member/household card and table modes, name/ID sorting, larger type and touch controls, mobile bottom navigation and improved document/committee styling. Desktop screenshot reviewed and card search, sorting and quick-create dialog verified. Existing 24 domain checks continue to pass.


## V3 — public website and demo entry

Royal maroon/cream public homepage, searchable 12-committee directory, individual committee pages, consent-filtered leadership, project details, meeting notices and approved financial summaries. Routes: #home, #tole/1 through #tole/12, #login/1. Demo entry selects a fictional tenant/role and opens the existing portal; exit returns to the committee website. Session is memory-only and refresh requires demo entry again. This is not real authentication. Production public data must be served separately with server-side authorization; all bundled records remain fictional. Real official contacts, real accounts and account recovery remain unimplemented.

Verification: 24 existing domain tests and 6 public-projection/route tests (30 total). The Simulation Centre retains its separate 24 domain checks and explicitly unimplemented cases. Desktop browser verified homepage, committee page, demo entry and household portal. Responsive CSS included; mobile device QA remains pending.


## V4 usability improvements
Bilingual Nepali/English committee search with reset and live result count; expandable help; mobile public quick navigation; improved readable contrast, touch controls and focus indicators. Public and management dialogs trap keyboard focus, support Escape and restore trigger focus. Committee officer titles stay stable after consent changes in both views. Date tiles use the record month. Table pagination disables unavailable pages. Mobile dashboard has a dismissible menu backdrop.
Validation: 32 automated domain/public tests; desktop browser verified English search, modal initial focus, Escape and focus return, and help expansion. Mobile CSS changes included, but physical-device testing remains pending. Real authentication and production RLS are unchanged and remain unimplemented.
