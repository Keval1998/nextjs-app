This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


# Subapas (local dev + deploy guide)

## Quick start (local)
1. Install deps
```bash
npm install

cp .env.example .env.local
# Fill in the real values, especially NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
# Add SUPABASE_SERVICE_ROLE_KEY to .env.local for local server-only calls.

# In some cloud editors bind host to all interfaces:
HOST=0.0.0.0 PORT=3000 npm run dev
# Or run:
npm run dev


## Apply DB migrations (Supabase SQL editor or supabase CLI)
Place your SQL files in db/migrations/ with timestamped names such as:
db/migrations/20251116_145700__001_create_core_tables.sql
Run them via Supabase SQL editor or your CI.
Seed initial data (optional)
Place seeds in db/seeds/ (e.g., 20251116_151000__seed_vendors.sql) and run them once.

## Deploying (Vercel)
Add environment variables in Vercel project settings:
NEXT_PUBLIC_SUPABASE_URL (value: Supabase project URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY (value: anon key)
SUPABASE_SERVICE_ROLE_KEY (value: service role key — mark as secret)
Push to your repository and deploy. Vercel will use the vars for server-side builds/runtime.

## Naming & conventions
Migrations: YYYYMMDD_HHMMSS__NN_description.sql
Lib code: lib/<feature>/<purpose>.ts
API routes: app/api/<resource>/<action>/route.ts


---

## `package.json` scripts (suggested additions)
Add or merge these scripts in `package.json`:

```json
"scripts": {
  "env:copy": "cp .env.example .env.local || echo 'copy .env.example to .env.local manually'",
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}
