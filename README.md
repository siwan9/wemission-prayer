# wemisson-prayer

## Database setup

- New, empty Supabase project: run `supabase/complete_setup.sql` once.
- Existing production database: keep using the incremental files under
  `supabase/migrations/` only when a new migration is added.
- Do not run the complete setup file over the current production database.

See `supabase/README.md` for the schema, security, performance, and recovery
notes. The fresh-install admin PIN is a temporary `CHANGE_ME_NOW` value and
must be changed immediately after setup.
