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

### How to Create a Test User

There are two ways to create a test user to log in to the portal:

**1. Using the UI (Sign Up)**
- Open the application at `http://localhost:5173/login`
- Click the "Create Account / Sign Up" tab.
- Enter an email and a password (min 8 characters).
- Click "Create Account". You will automatically be signed in.

**2. Directly via Supabase Dashboard**
- Go to your Supabase Project dashboard.
- Navigate to **Authentication → Users**.
- Click the **Add User** → **Create new user** button.
- Provide a test email (e.g. `test@example.com`) and a password.
- Check "Auto Confirm User".
- Click "Create User". You can now use these credentials to sign in to the portal.

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

---

## 🔐 API Key Security & Network Masking

The API Key Management system implements a **Zero-Trust Zero-Plain-Text** architecture to ensure credentials are never exposed, even in the browser's **Developer Tools (Network Tab)**.

### The "Double-Masking" Flow

1.  **Backend-Only Persistence**: Only the `sha256` hash of the API key is stored in the database. The plain-text secret is never saved to disk.
2.  **Permanent Masking (Listings)**: When fetching the list of keys, the database only returns the `key_masked` column (e.g., `kulu_sand...e24x`). The full secret is physically absent from the response body.
3.  **Network-Level Masking (Creation)**: To show the key exactly once during creation without exposing it in the Network Tab JSON:
    -   **Client-Side Scrambler**: The frontend generates a one-time random string (`clientMask`) in memory:
        ```javascript
        const clientMask = Math.random().toString(36).substring(2) + Date.now().toString(36);
        ```
    -   **Server-Side Scrambling**: This mask is sent to the Supabase RPC. The database generates the key and returns it under a scrambled field name (`scrambled_key`) after performing a transient obfuscation.
    -   **Zero-Plain-Text**: Any observer looking at the Network Tab response preview will see a scrambled hexadecimal string or a generic payload instead of a recognizable API key.
    -   **Frontend Reconstruction**: The React application uses the `clientMask` it still holds in memory to unscramble the secret and display it to the user exactly once.

### Why use the `clientMask`?
Without the `clientMask` handshake, the backend would have to send the `plain_text_key` in the JSON response. An attacker with a malicious browser extension or someone looking over the shoulder could easily see the secret in the **Response Preview** of the `generate_api_key` call. By using a client-injected scrambler, we ensure that the "On-the-wire" data is unreadable without the ephemeral mask stored in the browser's JS heap.

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

---

## 🏗️ Mock Data & Future Integrations

To provide a high-fidelity visual experience during the development and evaluation phase, the following sections currently utilize **Mock Data Generators**:

1.  **Usage Analytics (`/analytics`)**: The time-series traffic charts, error rates, and endpoint latency metrics are generated using `date-fns` and randomized distributions to simulate a production environment.
2.  **API Status (`/status`)**: The 90-day uptime aggregate and current service health indicators (Operational/Degraded) are statically defined based on a sample incident scenario.
3.  **Changelog (`/changelog`)**: The version history and update feed are loaded from a static JSON manifest (`src/apis/changelog.json`).

### Integration Strategy
In a production deployment, these components are designed to be swapped with:
- **Analytics**: A connection to a telemetry database (e.g., ClickHouse or Supabase Edge Functions logs).
- **Status**: An integration with a monitoring service (e.g., Checkly or BetterStack API).
- **Changelog**: A CMS-driven or database-backed table for dynamic update management.
