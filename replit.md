# Digital Sea — nuroctane.xyz

A personal digital sea — curated book library, quotes collection, and mechanical keyboard configurator.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/digital-sea run dev` — run the frontend dev server (Vite)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env (api-server): `nuroctanesitestorage_KV_REST_API_URL` + `nuroctanesitestorage_KV_REST_API_TOKEN` — Upstash Redis KV for visitor books and modkeys configs
- Required env (digital-sea): `VITE_GOOGLE_BOOKS_API_KEY` — for Google Books API integration

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TailwindCSS (site), Vanilla JS + Three.js (modkeys)
- API: Express 5 (Vercel serverless via `api/[...slug].js`)
- DB: PostgreSQL + Drizzle ORM (auth, modkeys configs)
- KV: Upstash Redis (visitor books, read overrides)
- Validation: Zod, `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (API server), Vite (frontend)
