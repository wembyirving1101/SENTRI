-- Additive migration shared by Deployment and Dispatch.
BEGIN;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS personnel_number VARCHAR(80);
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_version INTEGER NOT NULL DEFAULT 0;
COMMIT;
