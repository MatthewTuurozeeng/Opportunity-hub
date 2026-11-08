# Deployment

How to put OpportunityHub online with Vercel, connect it to Supabase, and check it before relying on it.

The frontend is a static site built from `client/`. The backend is the existing Supabase project. `client/vercel.json` already holds the build settings, client-side routing and security headers, so Vercel needs very little configuration.

## 1. Before you deploy

From the repository root:

```bash
git checkout main && git pull
supabase db push --remote --workdir server   # every migration is applied
cd client
npm ci
npm run lint && npx tsc -b && npm test && npm run build
```

All of these must pass. CI runs the same checks on every pull request.

## 2. Create the Vercel project

1. Sign in at [vercel.com](https://vercel.com) with GitHub and choose **Add New… › Project**.
2. Import the `Opportunity-hub` repository.
3. Set **Root Directory** to `client`. Vercel then reads `client/vercel.json`, which sets the framework (Vite), the build command (`npm run build`) and the output folder (`dist`).
4. Under **Environment Variables**, add both values from `client/.env` for the **Production** and **Preview** environments:

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | Your project URL, e.g. `https://<project-ref>.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | Your publishable key |

   Never add the service-role key. These two values are public and end up in the browser bundle anyway.
5. Choose **Deploy**. Every push to `main` then deploys to production, and every pull request gets its own preview URL.

## 3. Point Supabase at the live site

In the Supabase dashboard, open **Authentication › URL Configuration**:

1. Set **Site URL** to the production address, e.g. `https://opportunity-hub.vercel.app`.
2. Under **Redirect URLs**, add:
   - `https://opportunity-hub.vercel.app/**` (production)
   - `http://localhost:5173/**` (local development)
   - `https://*-<your-vercel-team>.vercel.app/**` (pull-request previews, optional)

Confirmation and email-change links redirect to these addresses, so they must match the live site.

Recommended under **Authentication › Sign In / Providers › Email**: keep **Confirm email** and **Secure email change** on.

## 4. Production checks

After the first deployment, work through this list on the live URL.

**Security**
- [ ] `https://` loads, and `http://` redirects to it.
- [ ] Response headers include `Content-Security-Policy`, `X-Frame-Options: DENY` and `Strict-Transport-Security` (browser dev tools › Network › the page request).
- [ ] Signed out, every page redirects to `/login`.
- [ ] `npm run security:check` (in `client/`) passes: signed-out visitors cannot read any data.

**Core workflow** (on a phone and a computer)
- [ ] Sign in, and a refresh keeps you signed in.
- [ ] Add an application, change its status, and see the history.
- [ ] Upload a document, attach it to the application, and open and download it.
- [ ] Add an event and see it on the calendar and dashboard.
- [ ] Log a communication and write a note.
- [ ] Export applications to CSV in **Settings › Data & backup**, then download a full backup.

**App install**
- [ ] Desktop Chrome or Edge: **Settings › App › Install** installs the app, and it opens in its own window.
- [ ] Android Chrome: **Install app** appears, and the icon looks right on the home screen.
- [ ] iPhone Safari: **Share › Add to Home Screen** works and shows the OpportunityHub icon.
- [ ] After a new deployment, an open app shows "A new version is available" and **Reload** updates it.

You can also run the automated checks against the live site, read-only:

```bash
cd client
E2E_BASE_URL=https://opportunity-hub.vercel.app npm run test:e2e
```

## 5. What the PWA stores on a device

The service worker caches only the app's own code, styles, fonts and icons, so the app opens quickly and even offline. Records and documents always come from Supabase and are never cached, as required by README section 9. Offline, the app shows a banner explaining that changes cannot be saved.

## 6. Rolling back

In Vercel, open **Deployments**, pick the last good deployment and choose **Promote to Production**. Database migrations are not rolled back by this. Fix the schema with a new migration instead of editing one that was already pushed.
