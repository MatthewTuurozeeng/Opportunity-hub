# OpportunityHub

**opportunities. applications. progress.**

A private, responsive web app for tracking scholarship, internship, job, fellowship and grant applications from first find to final outcome. It replaces scattered spreadsheets, folders, emails and notes with one organized workspace.

## Features

| Module | What it does |
|---|---|
| **Dashboard** | Headline stats, upcoming deadlines and interviews, applications by status, recent activity |
| **Applications** | Record opportunities and applications, save drafts, search, filter and sort, track status with full history |
| **Document Library** | Upload once and reuse across applications, keep every version, open files through short-lived private links |
| **Timeline & Calendar** | Deadlines, interviews, assessments and reminders in month and agenda views, plus a timeline per application |
| **Communications** | Log sent and received messages with summaries, links and attachments |
| **Notes & Reflections** | Interview preparation, feedback and lessons learned, optionally linked to an application |
| **Analytics** | Success and interview rates, outcomes over time, breakdowns by category and year |
| **Settings** | Profile, email and password, categories, invitations, CSV export and full JSON backup |

The app also has a public landing page, installs as a PWA on phone and desktop, and works with keyboard and screen readers.

## Access and privacy

- **Invite-only:** the first account is the owner. After that, only email addresses the owner invites (in **Settings › Invitations**) can sign up. The database enforces this rule.
- **Private accounts:** Row Level Security keeps each account's data separate. Documents live in a private storage bucket.
- **Nothing private offline:** the service worker caches only the app shell, never records or documents.

See [docs/security/security-review.md](docs/security/security-review.md) for each security requirement and the test that proves it.

## Tech stack

| Area | Tools |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui (Base UI), React Router |
| Data and forms | TanStack Query, React Hook Form, Zod |
| Charts and icons | Recharts, Lucide |
| Backend | Supabase: PostgreSQL, Auth, Storage, Row Level Security |
| Testing | Vitest, React Testing Library, Playwright, pgTAP |
| Hosting | Vercel (static frontend), PWA via `vite-plugin-pwa` |

## Project structure

```text
client/                 React app
  src/features/         One folder per module (pages, components, hooks, services, schemas)
  src/components/       Shared layout, UI primitives and building blocks
  e2e/                  Playwright end-to-end tests
  scripts/              Live security check
  vercel.json           Routing, caching and security headers
server/supabase/
  migrations/           Schema, RLS, storage policies and functions, applied in order
  tests/                pgTAP database security tests
docs/                   Deployment guide and security review
.github/workflows/      CI: lint, type checks, tests, build, database tests
```

## Getting started

**Requirements:** Node.js 22 or later, and the [Supabase CLI](https://supabase.com/docs/guides/cli) for database work.

```bash
cd client
npm install
npm run dev        # http://localhost:5173
```

`client/.env` holds the two public Supabase settings (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). Never add the service-role key.

**Database:** see [server/README.md](server/README.md) for first-time setup, migrations and type generation. To apply new migrations:

```bash
supabase db push --remote --workdir server
```

## Scripts

Run these from `client/`.

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build with the production security headers |
| `npm run lint` | Lint the code |
| `npm test` | Unit and component tests |
| `npm run test:e2e` | End-to-end tests (signed out; the signed-in workflow is opt-in) |
| `npm run security:check` | Confirm signed-out visitors cannot reach any data in the live project (read-only) |
| `npm run db:types` | Regenerate TypeScript types from the database |
| `npm run icons` | Regenerate the app icons from `public/favicon.svg` |

The database tests need Docker: `supabase start --workdir server`, then `supabase test db --workdir server`. CI runs every check on each pull request.

## Deployment

The frontend deploys to Vercel with the root directory set to `client`. [docs/deployment.md](docs/deployment.md) covers the Vercel and Supabase setup, a production checklist and rollback.

## Conventions

- **Branches and PRs:** feature branches merged to `main` through pull requests. Commit messages follow `feat:`, `fix:`, `test:`, `docs:`, `chore:`.
- **Schema changes:** always a new migration. Never edit one that has already been pushed.
- **Design:** midnight navy (`#0F1B2D`) with a golden accent (`#E6B653`) and the Inter font. Status is never shown by colour alone.
