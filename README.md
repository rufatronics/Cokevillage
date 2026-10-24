# CK Village Ordering (BUK Campus Vendor & Ordering Platform)

CK Village Ordering is a mobile-first web app for Bayero University Kano (BUK) students to browse vendors in CK Village, order online, or connect via WhatsApp.

## Tech Stack
- **Framework:** Next.js App Router (strict TypeScript, Tailwind CSS)
- **Database & Auth:** Supabase (Postgres with RLS, Realtime, Storage)
- **Payments:** Paystack with subaccounts (split payments)
- **Hosting:** Render Web Service
- **Testing & Quality:** Vitest, Playwright, ESLint, TypeScript

---

## Local Development Setup

1. **Clone the repository:**
   ```
   git clone <repo-url>
   cd ck-village-ordering
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local` and fill in your Supabase, Paystack, and Upstash credentials:
   ```
   cp .env.example .env.local
   ```

4. **Start local development server:**
   Start the dev server: `npm run' + ' dev`
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run Checks and Tests:**
   ```
   npm run lint
   npm run typecheck
   npm test
   ```

---

## Supabase Database & Migrations Setup

All database migrations are stored as SQL files in `supabase/migrations/`.

1. **Install Supabase CLI:**
   ```
   npm install -g supabase
   ```

2. **Initialize & Link Supabase Project:**
   ```
   supabase login
   supabase link --project-ref <your-project-ref>
   ```

3. **Apply Database Migrations:**
   ```
   supabase db push
   ```

---

## Render Deployment Setup

1. **Create Web Service on Render:**
   - **Environment:** Node.js
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`

2. **Set Environment Variables on Render:**
   Configure the exact variable names listed in `.env.example`:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `PAYSTACK_SECRET_KEY`
   - `PAYSTACK_PUBLIC_KEY`
   - `PLATFORM_FEE_PERCENT`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `CRON_SECRET`

---

## Phase 1 Status
Phase 1 (Foundation + Schema + RLS) is complete. The database schema, indexes, trigram search support, RLS policies, storage bucket policies, RPC functions (`verify_pickup`), environment variable validation, and verification tests are fully implemented and verified.
