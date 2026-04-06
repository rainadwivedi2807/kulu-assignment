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

## 🔌 Dynamic API Registration Flow

The entire developer portal — including the API Catalogue sidebar, the Endpoint documentation viewer, and the Interactive Sandbox — is completely data-driven. 

### The Flow: How it works under the hood

1. **`openapi.json` as the source of truth**: The metadata (endpoints, paths, parameters, request bodies) is populated directly from an OpenAPI standard v3 JSON specification.
2. **Centralized Registry (`api-registry.ts`)**: The application relies on `API_REGISTRY` exported from `src/apis/api-registry.ts`. When a new entry is added to this array, the entire application dynamically reacts to it.
3. **Component Injection**:
    - The `Sidebar.tsx` maps over `API_REGISTRY` to auto-generate navigation sidebar links dynamically.
    - The `SandboxPage.tsx` builds the "Target API" dropdown list and dynamically reads the endpoints and schema configurations to build input forms for parameters and headers.
    - The `ApiDocPage.tsx` interprets the OpenAPI paths and generates the parameter tables and status code response blocks.

### Adding a new API (< 5 minutes)

Adding a completely new set of endpoints requires exactly zero lines of React/UI code changes:

1. Create a new folder for your API inside `src/apis/` (e.g., `src/apis/weather/`)
2. Drop your `openapi.json` specification file in that folder.
3. Import that JSON and add a new object to the `API_REGISTRY` array in `src/apis/api-registry.ts`.
4. **Done:** The Catalogue, Sidebar navigations, and Interactive Sandbox automatically pick it up and surface it to your developers.

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
