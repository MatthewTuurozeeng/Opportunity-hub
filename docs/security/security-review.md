# Security review

Phase 9 review of how OpportunityHub meets the security requirements in README section 9, and which test proves each one.

Reviewed: 10 November 2026.

## Requirements and evidence

| # | Requirement | How it is enforced | Verified by |
|---|---|---|---|
| 1 | Protected pages require sign-in | `ProtectedRoute` redirects signed-out visitors to `/login` and returns them afterwards | `ProtectedRoute.test.tsx`; `e2e/signed-out.spec.ts` (all private routes, desktop and mobile) |
| 2 | RLS on every user table | `enable row level security` on all ten tables, including `notes` | `01_row_level_security.test.sql` |
| 3 | Users reach only their own rows | Owner-only policies on `user_id`; composite `(id, user_id)` foreign keys stop linking to another user's records | `01_row_level_security.test.sql` (reads, updates, deletes, forged owners, cross-user links) |
| 4 | Private storage bucket | `documents` bucket is not public; files live in `<user_id>/` | `01_row_level_security.test.sql`; `npm run security:check` (public URL returns an error) |
| 5 | Storage policies enforce ownership | Select/insert/update/delete policies check the first folder equals `auth.uid()` | `01_row_level_security.test.sql` (cannot see or upload into another folder) |
| 6 | File type and size validation | Client checks type and 10 MiB limit before upload; the bucket enforces the same MIME list and size | `fileUtils.test.ts`; `UploadDocumentDialog.test.tsx` |
| 7 | No service-role key in the frontend | The client only reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` | Code review: no other Supabase key is referenced in `client/` |
| 8 | Public configuration in environment variables | `client/.env` holds only the two public values; `.gitignore` blocks other env files | Code review |
| 9 | Secure sessions | Supabase Auth with token refresh; a single owner account enforced in the database | `03_single_owner.test.sql` |
| 10 | Important operations validated in the database | Check constraints (draft has no submission date, `https://` links, event times, storage path), append-only status history, atomic write functions | `02_data_integrity.test.sql` |

Signed-out access was also checked against the live project with `npm run security:check`: all ten tables, the documents bucket and both write functions are blocked; `owner_account_exists` reveals only a yes/no.

## Findings

| Finding | Severity | Status |
|---|---|---|
| `change_application_status` attached a note to the newest history row by `changed_at`. Within one transaction every row shares the same `now()`, so the note could land on the wrong row. | Low (data accuracy, not access) | Fixed in `20261110000100_attach_status_note_precisely.sql` |
| No browser security headers (Content-Security-Policy, frame protection) are configured yet. | Medium | Planned for Phase 10, where hosting headers are set in the Vercel configuration |
| The full signed-in end-to-end workflow needs real credentials and writes to the live project, so it is opt-in rather than run in CI. | Informational | Accepted. It cleans up after itself; see `client/e2e/workflow.spec.ts` |

No issue was found that lets a signed-out visitor, or a second account, read or change the owner's data.

## Running the checks

| Check | Command | Where |
|---|---|---|
| Unit and component tests | `npm test` | `client/` |
| End-to-end, signed out (read-only) | `npm run test:e2e` | `client/` |
| End-to-end, signed-in workflow (opt-in) | `E2E_EMAIL=… E2E_PASSWORD=… npm run test:e2e -- --project=desktop` | `client/` |
| Live signed-out access check (read-only) | `npm run security:check` | `client/` |
| Database security tests | `supabase start --workdir server` then `supabase test db --workdir server` (needs Docker) | repository root |

CI (`.github/workflows/ci.yml`) runs lint, type checks, unit and component tests, the build, and the database tests on every pull request.
