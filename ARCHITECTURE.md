# Learnium — Network & Backend Architecture

> Living doc. Covers how data travels across the deployment and how the
> backend is organized. Frontend build: Vite SPA (`frontend/dist/`).
> Backend: Express 5 + Mongoose 9 (`backend/server.js`). DB: MongoDB Atlas.

---

## 1. Network topology (current production state)

```
                        ┌─────────────────────────────────┐
                        │        User browser             │
                        │  landing / solve / dashboard /  │
                        │  admin SPA pages                │
                        └────────┬───────────┬────────────┘
         static pages (443)      │           │  accounts.google.com (GIS)
                                 │           │  popup → ID token (JWT)
                                 ▼           ▼
┌────────────────────────────────────────────────────────┐
│ DNS: learnium.in                                       │
│  apex @  → A 216.198.79.1 (Vercel) → 308 → www         │  ← to be moved to
│  www     → CNAME/hosting → Hostinger public_html       │    147.93.17.233
│            (Apache + .htaccess SPA fallback)           │
└────────────────────────────────────────────────────────┘
                                 │  fetch https://…/api/* (CORS)
                                 │  Origin: https://www.learnium.in
                                 ▼           (soon + apex)
┌────────────────────────────────────────────────────────┐
│ Render: learnium-wxsl.onrender.com (Node, persistent)  │
│  helmet → cors → passport → rate-limit → routes → DB   │
└────────┬───────────────────────────────┬───────────────┘
         │  mongoose (TLS, MONGO_URI)    │  verifyIdToken
         ▼                               ▼  (google-auth-library)
┌──────────────────┐            ┌──────────────────┐
│  MongoDB Atlas   │            │ Google OAuth2    │
│  users/exams/    │            │ tokeninfo        │
│  subjects/       │            └──────────────────┘
│  chapters/       │
│  questions/      │
│  attempts/       │
│  bookmarks/      │
│  mistakes        │
└──────────────────┘
```

Key constraints:
- Hostinger shared hosting serves **static files only** — no Node. Hence the
  split: static SPA on Hostinger, persistent API on Render.
- Vite **bakes env at build time**: `VITE_API_BASE_URL` and
  `VITE_GOOGLE_CLIENT_ID` are frozen into `dist/assets/*.js`. Changing them
  requires a rebuild + re-upload (see `LEARNIUM_REDESIGN_SPEC.md` §30).
- Apex currently hops through Vercel (308). Moving `@` A-record to
  `147.93.17.233` removes that hop; nothing code-side changes.

---

## 2. How data travels — end-to-end request lifecycle

Every `/api/*` call walks the same pipeline in `server.js`:

```
1. helmet()                        security headers
2. express.json({limit:'100kb'})   body parse
3. cors()                          Origin must be in allowedOrigins
                                   (localhost:5173, www.learnium.in, FRONTEND_URL)
                                   → else CORS error, request never reaches routes
4. passport.initialize()           stateless, no session
5. rate limiters                   300/15min global; 60/15min on
                                   login/register/forgot/reset
6. route match (first wins):
     /api/health                   → {status:'ok'} (no auth)
     /api/mistakes                 → mistakeRoutes
     /api/dashboard                → dashboardRoutes
     /api/admin                    → adminRoutes
     /api                          → catalogRoutes  (/exams…)
     /api/auth                     → authRoutes
     /api                          → questionRoutes (/chapters…,/questions…)
     /api/progress                 → progressRoutes
7. route middleware chain          e.g. auth → requireRole → validate → controller
8. controller → Mongoose → Atlas → JSON response
9. notFound (404 JSON) → errorHandler (unified shape, no stack in prod)
```

Auth identities: `authMiddleware` (strict Bearer → 401), `optionalAuth`
(attach-or-null, public browsing), `requireRole('admin')` (403). JWT payload
is always `{id, email, role}`, 7-day expiry (`JWT_EXPIRY`), signed with
`JWT_SECRET`. Token lives in `localStorage['learnium_token']`, sent as
`Authorization: Bearer` by the axios interceptor (`frontend/src/api/axios.js`).

---

## 3. Feature data flows

### 3.1 Google sign-in (GIS, primary)
```
[Login page] GoogleSignInButton
  → validates VITE_GOOGLE_CLIENT_ID format (*.apps.googleusercontent.com)
  → loads accounts.google.com/gsi/client → renders Google button
  → user picks account → Google returns ID token (credential)
  → POST /api/auth/google {idToken}
      → OAuth2Client.verifyIdToken({audience: GOOGLE_CLIENT_ID})
      → check sub + email + email_verified + aud
      → find User{googleId} → else link by email → else create
         (each branch auto-promotes if email ∈ ADMIN_EMAILS)
      → 200/201 {user{id,name,email,role,avatarUrl}, token}
  → login(user,token) → navigate(returnTo || /exams)
```
Legacy fallback: `GET /api/auth/google → Google consent →
/google/callback → 302 FRONTEND_URL/auth/callback?token= → AuthCallback.jsx
→ GET /auth/me → logged in`. Needs `SERVER_URL/.../callback` in Google's
redirect-URI allowlist (see `backend/GOOGLE_SETUP.md`).

### 3.2 Password auth + reset
```
Register: POST /auth/register {name,email,password}
  → validate (name 2–80, email regex, pw ≥ 8) → 409 if taken
  → bcrypt.hash(10) → role = ADMIN_EMAILS match ? admin : student
Login:    POST /auth/login → bcrypt.compare → auto-promote if allowlisted
Forgot:   POST /auth/forgot-password {email} → ALWAYS 200 (no enumeration)
  → if user has password: raw token → sha256 stored + 1h expiry
  → reset URL logged server-side; returned in body only outside production
Reset:    POST /auth/reset-password {token,password}
  → find by hashed token + expiry → hash new pw → clear token
Frontend: /forgot-password → /reset-password?token= (same auth card style)
```

### 3.3 Practice loop (public, anonymous-safe)
```
ExamSelect:    GET /api/exams  (+ GET /progress/overview when logged in)
SubjectSelect: GET /api/exams/:examId/subjects
ChapterSelect: GET /api/subjects/:subjectId/chapters
Solve:         GET /api/chapters/:chapterId/questions?difficulty=
                 → strips correctOption/explanation server-side (anti-cheat)
               POST /api/questions/:id/attempt {selectedOption,timeTakenSec}
                 → grades; anon → {…, tracked:false} (upsell to register)
                 → authed → Attempt.create + upsert MistakeNotebookEntry
                            {unreviewed,lastWrongAt} on wrong answers
```

### 3.4 Dashboard / mistakes / progress (authed)
```
Dashboard:  GET /dashboard/summary → {streak,questionsSolved,accuracy,totalAttempts}
Mistakes:   GET /mistakes?status= → populated question+chapter cards
            PATCH /mistakes/:id {reviewStatus,notes} (ownership-scoped {_id,user})
Progress:   GET /progress/overview → per-chapter {attempted,correct,total,
            accuracy,lastAt} + continue{chapterId,…} (powers ProgressRing,
            continue card, dashboard weak-spot line; anon → empty)
```

### 3.5 Admin CSV import
```
AdminImport → download template (csvTemplate(), 16 sample rows)
  → upload .csv → POST /admin/questions/import (FormData{file})
      → multer (memory, 5 MB, .csv only) → csv-parse/sync
      → ≤1000 rows; per row: upsert Exam→Subject→Chapter (chapterCache Map)
      → validateQuestionInput → Question.create
      → 201 {imported, failed, errors:[{line,error}]≤50}
Columns: examName,examSlug,subjectName,subjectSlug,chapterName,chapterSlug,
orderIndex,questionText,optionA–E,correctOption,explanation,difficulty,year,tags(;)
```

---

## 4. Backend layer map

```
server.js (entry: middleware order, mounts, boot checks)
├── config/        db.js (connect) · passport.js (legacy Google strategy)
├── middleware/    authMiddleware.js (auth/optionalAuth/requireRole)
│                  validate.js (ObjectId/attempt/mistake/query validators)
│                  errorHandler.js (notFound + unified errors)
├── routes/        auth · catalog · question · mistake · dashboard
│                  progress · admin (auth+role+multer wiring only)
├── controllers/   auth · googleAuth · catalog · question · mistake
│                  dashboard · progress · admin (business logic)
├── services/      contentService.js (slugify, upserts, question validate/normalize)
├── utils/         adminAllowlist.js (ADMIN_EMAILS parsing)
├── models/        User Exam Subject Chapter Question Attempt Bookmark
│                  MistakeNotebookEntry (index.js re-exports)
└── scripts/       make-admin.js <email> (promote by email)
└── seed/          seed.js (dev wipe) · loadContent.js (JSON loader) · data/
```

Route → auth matrix:

| Mount | Endpoints | Guard |
|---|---|---|
| `/api/health` | GET health | none |
| `/api/auth` | register, login, forgot/reset, me, google (GIS+legacy), google/status | public + limiters; `me` strict |
| `/api` (catalog) | exams, subjects, chapters | `optionalAuth` |
| `/api` (questions) | chapter questions, question, attempt | `optionalAuth` (+validators) |
| `/api` (questions) | bookmark add/remove | strict |
| `/api/mistakes` | list, update | strict (+validators) |
| `/api/dashboard` | summary | strict |
| `/api/progress` | overview | `optionalAuth` |
| `/api/admin` | overview, stats, users, content CRUD, bulk, import | strict + `requireRole('admin')` |

---

## 5. Database schema & relationships

```
Exam {name, slug!unique}
 │ 1—N  Subject {exam→Exam, name, slug}  unique(exam,slug)
 │       │ 1—N  Chapter {subject→Subject, name, slug, orderIndex}  unique(subject,slug)
 │       │       │ 1—N  Question {chapter→Chapter, questionText, options[{id,text}]≥2,
 │       │       │                correctOption, explanation?, year?, difficulty, tags[]}
User {name, email!unique, passwordHash?, googleId?(sparse unique),
│     avatarUrl?, examFocus?, role student|admin,
│     resetPasswordToken?(hidden), resetPasswordExpires?(hidden)}
 │ 1—N  Attempt {user, question, selectedOption, isCorrect,
 │               timeTakenSec?, attemptedAt}
 │ M—N  Bookmark {user, question}  unique(user,question)
 └ M—N  MistakeNotebookEntry {user, question,
        reviewStatus unreviewed|reviewing|learned, notes?, lastWrongAt}
        unique(user,question)
```

Notes: all schemas `{timestamps:true}`; Mongoose 9 uses
`returnDocument:'after'` (no legacy `new:true`); cascade deletes in
`adminController` remove children (exam→subjects→chapters→questions) but
orphaned Attempt/Bookmark/Mistake rows are intentionally left (known gap).

---

## 6. Frontend architecture (data side)

```
main.jsx → App.jsx (AuthProvider > BrowserRouter > Routes)
├── public: /, /login, /register, /forgot-password, /reset-password,
│           /auth/callback, /exams…, /chapters/:id/solve, *
├── protected (ProtectedRoute → /login + returnTo): /dashboard, /mistakes
│           wrapped in AppShell (sidebar / topbar streak+accuracy / bottom tabs)
├── admin (RequireAdmin → role check): /admin, /users, /content, /import
│           wrapped in AdminLayout (tab nav + Outlet)
state:  AuthContext {user, loading, isAdmin} — restored via GET /auth/me
api:    api/axios.js (baseURL, Bearer inject, 401 cleanup) · api/admin.js (19 helpers)
ui:     QuestionCard · FilterBar · FeedbackPanel · ProgressRing · SearchBar ·
        SkeletonLoader · GoogleSignInButton · AppShell
env:    VITE_API_BASE_URL · VITE_GOOGLE_CLIENT_ID (both baked at build)
```

---

## 7. Environment & secrets map

| Var | Backend (Render) | Frontend (baked) |
|---|---|---|
| `MONGO_URI` | ✅ required | — |
| `JWT_SECRET` / `JWT_EXPIRY` | ✅ required | — |
| `SERVER_URL` | ✅ Render URL (OAuth callback) | — |
| `FRONTEND_URL` | ✅ site origin (CORS + redirects) | — |
| `GOOGLE_CLIENT_ID` / `_SECRET` | ✅ | ID only (`VITE_GOOGLE_CLIENT_ID`) |
| `ADMIN_EMAILS` | ✅ comma allowlist | — |
| `VITE_API_BASE_URL` | — | ✅ Render `/api` URL |

`.env` = real secrets, gitignored, per machine. `.env.example` = committed
template only. Changing any `VITE_*` needs rebuild + re-upload.
