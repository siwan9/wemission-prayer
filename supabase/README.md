# Supabase SQL guide

## New or restored project

Run `complete_setup.sql` once in the SQL Editor of a new, empty Supabase
project. It contains the complete database contract used by the current app:

- `camps`, `settings`, `registrations`, `camp_dates`, and `links` tables;
- singleton seed rows for settings and links;
- all RPC functions called from `src/services`;
- RLS policies and column-level API privileges;
- PIN access restrictions;
- paging, search, array, and camp aggregation indexes.

The initial admin PIN is `CHANGE_ME_NOW`. Change it immediately through the
admin settings page after the first login. Replace the placeholder camp dates
and content before opening the service.

Do not run `complete_setup.sql` over the current production database. It is a
bootstrap/recovery file for a blank project, not a production migration.

## Current production database

`migrations/202610290001_campaign_lifecycle.sql` is the incremental history
used to upgrade the existing database. It preserves earlier registrations,
groups them by camp, adds PIN-safe RPC functions, and adds the performance
indexes and paged queries.

The current production SQL has already been applied manually. Keep the file as
an audit trail; future schema changes should be added as a new migration and
also reflected in `complete_setup.sql` so a fresh project remains reproducible.

## Security model

- Public pages can read non-secret settings and prayer display fields.
- `registrations.pin` and `settings.admin_pin` cannot be selected directly.
- User PIN comparison happens inside `security definer` functions.
- The admin prayer list can return user PINs only after verifying the admin PIN.
- Direct registration inserts are restricted to the current camp and service
  date range by RLS.
- Table updates and deletes are performed only through verified RPC functions.

## Performance model

- The main calendar loads monthly counts and one selected day at a time.
- Current and archived searches run in PostgreSQL and return at most 50 rows.
- The admin prayer list loads 10 rows per page.
- Camp totals are aggregated in PostgreSQL.
- GIN/trigram indexes support date-array and name/church searches.
