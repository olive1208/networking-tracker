-- 0001_contacts.sql
-- Paste this ENTIRE file into the Neon SQL Editor and run it as one statement batch.
-- The table, its row-level security, the four ownership policies and the grants are
-- created together so the table is never reachable through the public Data API
-- without RLS in force.

BEGIN;

CREATE TABLE public.contacts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text        NOT NULL DEFAULT auth.user_id(),
  name        text        NOT NULL,
  company     text,
  role        text,
  where_met   text,
  notes       text,
  priority    text        NOT NULL,
  created_at  timestamptz DEFAULT now(),

  CONSTRAINT contacts_priority_check
    CHECK (priority IN ('high', 'medium', 'low')),
  CONSTRAINT contacts_name_not_blank_check
    CHECK (btrim(name) <> '')
);

-- Row Level Security: every row is owned by the user whose JWT `sub` claim
-- (exposed as auth.user_id()) matches user_id. Nothing is visible without a policy.
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY contacts_select_own ON public.contacts
  FOR SELECT TO authenticated
  USING (auth.user_id() = user_id);

CREATE POLICY contacts_insert_own ON public.contacts
  FOR INSERT TO authenticated
  WITH CHECK (auth.user_id() = user_id);

CREATE POLICY contacts_update_own ON public.contacts
  FOR UPDATE TO authenticated
  USING (auth.user_id() = user_id)
  WITH CHECK (auth.user_id() = user_id);

CREATE POLICY contacts_delete_own ON public.contacts
  FOR DELETE TO authenticated
  USING (auth.user_id() = user_id);

-- Let the Data API's `authenticated` role reach the table. RLS above still
-- restricts each request to the caller's own rows.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;

COMMIT;
