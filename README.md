# Call Monitoring — Frontend

**Version**: v1.0.0
**Last Updated**: 2026-08-25
**Purpose**: Frontend for the Call Monitoring take-home test — a Supervisor-facing dashboard to search, filter, sort, and paginate customer call sentiment data.

> Related: [Backend repository](https://github.com/opikzxx/call-monitoring-be) · User story: `THT-MON-US-001`

---

## 📋 Project Overview

This app implements **`THT-MON-US-001`**: a Supervisor logs in, then views a Monitoring page with a call-monitoring table (search, period filter, sentiment filter, sortable columns, pagination) backed by the [backend REST API](https://github.com/opikzxx/call-monitoring-be) and PostgreSQL — no data is hardcoded in the frontend.

### Technology Stack

- **Next.js 16** (App Router, Turbopack) — check version with `bun run next --version`
- **React 19**
- **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (Radix UI primitives) — component library
- **NextAuth 4** (Credentials provider, JWT session strategy) — authentication
- **TanStack Query** — server-state fetching/caching for the call-monitoring table
- **TanStack Table** — table sorting/pagination
- **React Hook Form** + **Zod** — form state and schema validation
- **Axios** — HTTP client to the backend API
- **Vitest** + **React Testing Library** — unit tests
- **Playwright** — end-to-end tests
- **Bun** — package manager and script runner
- **Docker** — containerized dev and production builds

### Documentation

- **Backend repository**: https://github.com/opikzxx/call-monitoring-be
- **User story**: `THT-MON-US-001` (see take-home test materials)

---

## 🏗️ Architecture

### Feature-Based Structure

Business logic is grouped by feature under `src/features/`, decoupled from routing (`src/app/`) and generic UI (`src/components/ui/`):

```
src/features/<feature>/
├── schema.ts        # Zod schemas + inferred types (API contracts)
├── api.ts           # Axios calls to the backend, parsed through the schema
├── hooks.ts         # TanStack Query hooks wrapping api.ts
├── filters.ts        # URL search-param <-> filter state helpers (if any)
└── components/       # Feature-specific UI
```

**Reference implementations**: `src/features/auth/` (simplest) and `src/features/call-monitoring/` (full CRUD-style read flow with filters/sort/pagination).

**Key rules**:
- Components never call `axios`/`fetch` directly — always through a feature's `api.ts`, which parses the response with a Zod schema.
- Server response shapes are the source of truth: define the Zod schema first, derive TypeScript types from it (`z.infer`), don't hand-write parallel interfaces.
- Route files under `src/app/` stay thin — they compose feature components, they don't contain business logic.
- Session/auth state: `src/lib/next-auth.ts` (NextAuth options), `src/proxy.ts` (route protection, Next.js 16's renamed `middleware.ts`), `src/lib/api/client.ts` (attaches the bearer token from `getSession()` to every API request).

---

## 🚀 Development Workflow

### Docker-First Approach

```bash
make quick   # copy .env.example -> .env, run unit tests, then docker compose up
```

Or step by step:

```bash
make env     # copy .env.example -> .env (only if .env doesn't exist yet)
make up      # start the dev container (hot-reload via bind mount)
make logs    # follow the container's logs
make down    # stop and remove the container
```

The app will be available at `http://localhost:3000`. It expects the [backend](https://github.com/opikzxx/call-monitoring-be) to be reachable at `http://localhost:8080` (see `NEXT_PUBLIC_API_URL`).

### Running Without Docker

```bash
bun install
bun run dev
```

### Pre-Commit Checklist

```bash
bun run lint      # ESLint
make test         # Unit tests (Vitest)
make test-e2e     # End-to-end tests (Playwright) — requires the backend running for real data
```

---

## 🧪 Testing

### Unit Tests (Vitest + React Testing Library)

Covers schema validation, the login/logout flow, and NextAuth's credentials `authorize`/`jwt`/`session` callbacks.

```bash
make test            # bunx vitest run
bunx vitest           # watch mode
```

### End-to-End Tests (Playwright)

Covers the full auth flow against a lightweight mock backend (`e2e/mock-backend.mjs`) standing in for the real API: unauthenticated redirect, form validation, invalid credentials, successful login, and logout.

```bash
make test-e2e         # bunx playwright test
```

> **Note**: Vitest and Playwright are run directly on the host (`bunx ...`), not inside the Docker container — a plain Bun-only container has no separate Node.js runtime, which breaks Vitest's module mocking for local files. Run these with Bun installed alongside a recent Node.js (≥ 20.9) on your machine.

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (called from both the browser and the server) | `http://localhost:8080` |
| `NEXTAUTH_URL` | Canonical URL of this app, required by NextAuth | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret used to sign session JWTs | *(required, no default)* |
| `APP_PORT` | Host port the dev container publishes | `3000` |

Copy `.env.example` to `.env.local` (or `.env` for Docker) and adjust as needed:

```bash
cp .env.example .env.local
```

Validation for these is centralized in `src/lib/env.ts` using `@t3-oss/env-nextjs` + Zod — the app fails fast at startup if a required variable is missing.

---


## 🔧 Quick Reference

### Essential Commands

| Task | Command |
|---|---|
| Start development (Docker) | `make up` |
| Stop containers | `make down` |
| View logs | `make logs` |
| Run unit tests | `make test` |
| Run e2e tests | `make test-e2e` |
| Lint code | `bun run lint` |
| Run dev server (no Docker) | `bun run dev` |
| Build production bundle | `bun run build` |
| Start production server | `bun run start` |
| Copy env template | `make env` |
| Clean restart | `make down && make up` |

### Project Structure

```
frontend/
├── e2e/                       # Playwright specs + mock backend for e2e
├── src/
│   ├── app/                   # Next.js App Router routes
│   │   ├── api/auth/[...nextauth]/  # NextAuth route handler
│   │   ├── dashboard/         # Protected dashboard route + shell layout
│   │   └── signin/            # Public sign-in page
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives (generic, no business logic)
│   │   ├── auth/               # Auth-specific layout pieces
│   │   └── shared/             # Cross-feature shared components
│   ├── features/
│   │   ├── auth/               # Login schema, API call
│   │   └── call-monitoring/    # Table schema, API, hooks, filters, components
│   ├── hooks/                  # Generic reusable hooks
│   ├── lib/                    # env validation, axios client, NextAuth config, utils
│   ├── types/                  # Ambient type augmentations (e.g. next-auth.d.ts)
│   └── proxy.ts                # Route protection (Next.js 16's renamed middleware)
├── Dockerfile                  # development / builder / production stages
├── docker-compose.dev.yml      # Dev container with hot-reload bind mount
├── Makefile                    # quick / env / up / down / logs / test / test-e2e
├── playwright.config.ts
├── vitest.config.mts
└── AGENTS.md                   # Next.js-specific notes for AI assistants (auto-managed by `next dev`)
```

---

## 💡 Notes for AI Assistants

1. **Follow the feature-based structure**: schema → api → hooks → components, mirrored from `src/features/call-monitoring/`.
2. **Never hardcode table data**: it must come from the backend API via a feature's `api.ts`.
3. **Validate at the boundary**: parse every API response with its Zod schema before using it.
4. **This is Next.js 16**: conventions differ from older training data (e.g. `middleware.ts` → `proxy.ts`). Check `AGENTS.md` and `node_modules/next/dist/docs/` before assuming API shape.
5. **Run tests on the host, not in Docker**: see the Testing section above for why.
6. **Check `make help`-equivalent**: all dev commands are in the `Makefile` at the project root.

---

## 🔗 Additional Resources

- **Backend repository**: https://github.com/opikzxx/call-monitoring-be
- **This repository**: https://github.com/opikzxx/call-monitoring-fe
