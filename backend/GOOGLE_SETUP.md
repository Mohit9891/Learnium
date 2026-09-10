# Google Sign-In Setup (GIS flow)

The `Error 401: invalid_client` popup means Google does not recognize the
client ID the frontend sends. It is a configuration problem, not a code bug.
Work through this checklist once and it goes away.

## 1. Create the OAuth client (one time, in Google Cloud Console)

1. Go to **Google Cloud Console → APIs & Services → Credentials**.
2. **Create Credentials → OAuth client ID → Application type: Web application.**
   (Must be **Web**, not Desktop/Android/iOS.)
3. Under **Authorized JavaScript origins**, add every origin that serves the app:
   - `http://localhost:5173` (local Vite dev)
   - `https://www.learnium.in` and any Vercel preview/prod URL you use
4. (Only needed for the legacy redirect fallback) Under **Authorized redirect URIs**, add:
   - `http://localhost:5000/api/auth/google/callback`
   - `https://<your-backend>/api/auth/google/callback`
5. Save, then copy the **Client ID** (ends with `.apps.googleusercontent.com`)
   and the **Client secret**.

Common causes of `invalid_client`:
- Truncated copy-paste (missing characters) or extra spaces.
- Client ID from a different Google Cloud project than the one with the OAuth consent screen.
- OAuth client was deleted in the console.
- Using a Desktop/Android client ID with the web button.

## 2. Backend `.env` (real secrets, never committed)

```ini
GOOGLE_CLIENT_ID=<paste the Web client ID>
GOOGLE_CLIENT_SECRET=<paste the client secret>
SERVER_URL=http://localhost:5000          # production: https://<your-backend>
FRONTEND_URL=http://localhost:5173        # production: https://www.learnium.in
ADMIN_EMAILS=you@example.com              # auto-promotes these users to admin
```

Verify without exposing secrets:

```bash
curl http://localhost:5000/api/auth/google/status
# {"gisConfigured":true,"redirectConfigured":true,"adminAllowlistConfigured":true}
```

All three should be `true`. If `gisConfigured` is `false`, the backend
client ID is missing or malformed.

## 3. Frontend env (public client ID — still keep it in env, not hardcoded)

Local dev — create `frontend/.env` (gitignored, there is intentionally no real
`.env` in the repo, only `.env.example` as a template):

```ini
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=<same Web client ID as the backend>
```

Production (Vercel) — set the same two variables in
**Project → Settings → Environment Variables**, then **redeploy**.
Vite bakes env vars into the bundle at build time, so changing a variable
without redeploying has no effect — this is the most common reason the
deployed site still shows `invalid_client` after fixing the value.

## 4. What the app does with a bad value

- `GoogleSignInButton` validates the format first. If it doesn't end with
  `.apps.googleusercontent.com`, the GIS button is not rendered and the
  redirect flow is offered instead, with a warning.
- GIS popup errors (`invalid_client`, blocked popups) are caught via
  `error_callback` and shown inline under the button.

## 5. `.env` vs `.env.example` — why both exist

- `.env` — your real secrets, on your machine only, **gitignored**, read by the
  app at runtime. Never committed, never shared.
- `.env.example` — a committed template listing which keys must exist, with
  empty/placeholder values. Safe to commit. Copy it to `.env` and fill in
  real values.

That is why you see "another .env": nothing extra was created with secrets.
`frontend/` has only `.env.example` (no real `.env` yet — create it per
section 3). `backend/` has the original `.env` (edited: typo fix + new keys)
plus the new `.env.example` template.
