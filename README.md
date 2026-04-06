# Kulu API — Developer Portal

An extensible external developer portal for a fintech platform. Built with React + TypeScript + Vite.

---

## ⚡ Quick Start (one command)

```bash
cp .env.example .env   # Fill in your Supabase credentials (see below)
npm install && npm run dev
```

The portal will be running at **http://localhost:5173**.

---

## 🔐 Authentication — Supabase Auth

**Provider chosen:** [Supabase Auth](https://supabase.com/docs/guides/auth)

### Why Supabase?

| Criterion               | Decision                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Production-grade**    | Row Level Security, JWT-based sessions, SOC 2 compliant infrastructure                                                |
| **Silent refresh**      | `autoRefreshToken: true` — Supabase client silently renews the access token before expiry without any user friction   |
| **Session persistence** | `persistSession: true` — session is stored in `localStorage` and rehydrated on page reload via `getSession()`         |
| **Tab sync**            | `onAuthStateChange` subscriber updates all open tabs automatically                                                    |
| **No vendor lock-in**   | Standard JWT tokens — can be replaced with Auth0/Firebase/custom JWKS endpoint by swapping `src/lib/supabase.ts` only |
| **Zero backend cost**   | Runs entirely client-side with the anon key; no custom auth server needed                                             |

### Auth flows implemented

- ✅ **Sign Up** — email + password with client-side validation (format, min 8 chars, confirm match) + server error surface
- ✅ **Sign In** — email + password with error states
- ✅ **Sign Out** — calls `supabase.auth.signOut()` via the sidebar button, redirects to `/login`
- ✅ **Protected routes** — `<ProtectedRoute>` wraps all dashboard pages; unauthenticated users get redirected to `/login` with the intended destination saved in `location.state.from` for post-login redirect
- ✅ **Session persistence** — survives page reload; a loading skeleton is shown while the session is rehydrated
- ✅ **Silent refresh** — Supabase SDK handles JWT refresh ~60 s before expiry automatically

### Setup

1. Create a free project at [https://supabase.com](https://supabase.com)
2. Go to **Project Settings → API**
3. Copy **Project URL** and **anon public key** into your `.env`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

4. Enable **Email** provider under **Authentication → Providers** in the Supabase dashboard.

---

## 🗂 Project Structure

```
src/
├── apis/                  # OpenAPI specs + registry (add new APIs here)
├── components/
│   ├── auth/              # ProtectedRoute guard
│   └── layout/            # Sidebar, DashboardLayout
├── context/
│   └── AuthContext.tsx    # Supabase session state + signUp/signIn/signOut
├── lib/
│   └── supabase.ts        # Supabase client singleton
├── pages/
│   └── LoginPage.tsx      # Sign in / Sign up UI
└── App.tsx                # Router + AuthProvider wiring
```

## 🔌 Adding a Second API (< 5 minutes)

1. Drop your `openapi.json` into `src/apis/<api-name>/openapi.json`
2. Register it in `src/apis/api-registry.ts`
3. Done — the Catalogue and Sandbox automatically pick it up

---

## Portal Sections

| Section              | Path              |
| -------------------- | ----------------- |
| Authentication       | `/authentication` |
| API Catalogue & Docs | `/docs`           |
| Interactive Sandbox  | `/sandbox`        |
| API Key Management   | `/keys`           |
| Usage Analytics      | `/analytics`      |
| API Status           | `/status`         |
| Changelog            | `/changelog`      |
