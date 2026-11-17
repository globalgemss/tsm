-- TSM production schema foundation (D1 / SQLite).
-- DESIGN ONLY: do not run against tsm-demo-db or existing demo data.
-- All private queries MUST be scoped by a server-verified committee membership.
-- D1 has no PostgreSQL row-level security; enforce tenancy in Worker APIs.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS committees (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  ward TEXT,
  address TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  auth_subject TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS committee_memberships (
  committee_id TEXT NOT NULL REFERENCES committees(id),
  user_id TEXT NOT NULL REFERENCES app_users(id),
  role TEXT NOT NULL CHECK(role IN ('admin','chair','secretary','treasurer','member','viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended')),
  PRIMARY KEY (committee_id,user_id)
);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON committee_memberships(user_id,status);
CREATE TABLE IF NOT EXISTS households (
  id TEXT PRIMARY KEY,
  committee_id TEXT NOT NULL REFERENCES committees(id),
  house_number TEXT,
  address TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (committee_id,id)
);
CREATE INDEX IF NOT EXISTS idx_households_tenant ON households(committee_id,house_number);
CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  committee_id TEXT NOT NULL,
  household_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  consent_at TEXT,
  public_profile INTEGER NOT NULL DEFAULT 0 CHECK(public_profile IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (committee_id,household_id) REFERENCES households(committee_id,id)
);
CREATE INDEX IF NOT EXISTS idx_people_household ON people(committee_id,household_id);
CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  committee_id TEXT NOT NULL REFERENCES committees(id),
  title TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  venue TEXT,
  agenda TEXT,
  minutes TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','open','closed')),
  revision INTEGER NOT NULL DEFAULT 1,
  UNIQUE (committee_id,id)
);
CREATE INDEX IF NOT EXISTS idx_meetings_tenant_date ON meetings(committee_id,starts_at);
CREATE TABLE IF NOT EXISTS attendance (
  committee_id TEXT NOT NULL,
  meeting_id TEXT NOT NULL,
  person_id TEXT NOT NULL REFERENCES people(id),
  status TEXT NOT NULL CHECK(status IN ('present','absent','late')),
  marked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (meeting_id,person_id),
  FOREIGN KEY (committee_id,meeting_id) REFERENCES meetings(committee_id,id)
);
CREATE TABLE IF NOT EXISTS ledger_entries (
  id TEXT PRIMARY KEY,
  committee_id TEXT NOT NULL REFERENCES committees(id),
  household_id TEXT REFERENCES households(id),
  entry_type TEXT NOT NULL CHECK(entry_type IN ('income','expense','reversal')),
  amount_paisa INTEGER NOT NULL CHECK(amount_paisa > 0),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  created_by TEXT NOT NULL REFERENCES app_users(id),
  approved_by TEXT REFERENCES app_users(id),
  idempotency_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (committee_id,idempotency_key)
);
CREATE INDEX IF NOT EXISTS idx_ledger_status ON ledger_entries(committee_id,status,created_at);
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  committee_id TEXT NOT NULL REFERENCES committees(id),
  title TEXT NOT NULL,
  budget_paisa INTEGER NOT NULL DEFAULT 0 CHECK(budget_paisa >= 0),
  progress_pct INTEGER NOT NULL DEFAULT 0 CHECK(progress_pct BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'planned',
  revision INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_projects_tenant ON projects(committee_id,status);
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  committee_id TEXT NOT NULL REFERENCES committees(id),
  actor_user_id TEXT NOT NULL REFERENCES app_users(id),
  action TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_date ON audit_events(committee_id,occurred_at);
-- Before production: verify the auth provider, authorization middleware,
-- user-to-household relations, consent/retention, backups, and migration tests.
