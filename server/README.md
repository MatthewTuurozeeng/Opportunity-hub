# Server: Supabase

The backend is a hosted Supabase project. This folder holds its version-controlled configuration and database migrations.

| Path | Purpose |
|---|---|
| `supabase/config.toml` | Local Supabase CLI configuration. |
| `supabase/migrations/` | Database schema, triggers, Row Level Security and storage policies, applied in filename order. |

## Migrations

| Migration | What it does |
|---|---|
| `..._create_core_schema.sql` | Enums, the nine tables, `updated_at` triggers, constraints and indexes. |
| `..._create_profile_on_signup.sql` | Creates a profile and default opportunity categories for each new user. |
| `..._record_application_status_history.sql` | Records every application status change automatically. |
| `..._enable_row_level_security.sql` | Restricts every table to the signed-in owner. |
| `..._create_documents_storage_bucket.sql` | Private `documents` bucket (10 MiB, PDF/Word/text/images) with per-user folder policies. |
| `..._restrict_to_single_owner.sql` | Allows exactly one account. Every sign-up after the owner's is rejected by the database. |
| `..._create_application_functions.sql` | Atomic functions to create/update an opportunity with its application and change status with a note. |

Ownership is enforced at two levels: Row Level Security limits each user to their own rows, and composite foreign keys on `(id, user_id)` prevent linking a record to a parent owned by someone else.

## First-time setup

1. **Create a project** at [supabase.com](https://supabase.com) (Free plan).
2. **Link and push the migrations** from the repository root:

   ```bash
   supabase login
   supabase link --project-ref <your-project-ref> --workdir server
   supabase db push --remote --workdir server
   ```

3. **Keep sign-ups enabled.** In Authentication › Sign In / Providers, leave **Allow new users to sign up** on. The database accepts only the first account, so nobody else can register.
4. **Set redirect URLs.** Go to Authentication › URL Configuration and set the Site URL to `http://localhost:5173` (change it to the Vercel URL after deployment). Email confirmation links redirect here.
5. **Configure the client.** Copy the Project URL and publishable key from Project Settings › API into `client/.env`.
6. **Create the owner account** by running the app and choosing **Create your account** on the sign-in page. If **Confirm email** is on (Authentication › Sign In / Providers › Email), open the confirmation link sent to your inbox before signing in.
7. **Generate TypeScript types** from the `client/` folder:

   ```bash
   npm run db:types
   ```

## Changing the schema

Never edit a migration that has already been pushed. Create a new one instead:

```bash
supabase migration new <descriptive_name> --workdir server
```

Then push it with `supabase db push --remote --workdir server` and regenerate the types.

Never put the service-role key in `client/.env` or any frontend code.
