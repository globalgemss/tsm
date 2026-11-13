CREATE TABLE IF NOT EXISTS demo_workspaces (
 session_hash TEXT NOT NULL,
 mode TEXT NOT NULL CHECK(mode IN ('seeded','empty')),
 revision INTEGER NOT NULL,
 payload TEXT NOT NULL CHECK(json_valid(payload)),
 updated_at INTEGER NOT NULL,
 PRIMARY KEY(session_hash,mode)
);
CREATE INDEX IF NOT EXISTS demo_workspace_updated ON demo_workspaces(updated_at);
