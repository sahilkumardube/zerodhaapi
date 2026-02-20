# Zerodha Automated Options Trader

Production-oriented Next.js full-stack trading system for intraday NIFTY/SENSEX option structures with Zerodha Kite APIs.

## Features

- Zerodha OAuth flow (`/api/auth/login-url`, callback token exchange)
- Instrument refresh and option universe cache
- Strategy scheduler with entry windows:
  - 09:20-09:25
  - 09:25-09:30
- NIFTY and SENSEX target premium strike selection
- 50% per-short-leg SL and opposite-leg move-to-cost adjustment
- Hard exit route at 15:15
- Risk snapshots and daily max-loss lock
- Dashboard, positions, orders, risk, logs pages
- SSE endpoint + polling-friendly frontend
- Vercel cron-ready config

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Zustand + TanStack React Query
- Prisma + PostgreSQL
- Upstash Redis
- Recharts

## Setup

1) Install dependencies

```bash
npm install
```

2) Configure env

```bash
cp .env.example .env
```

Fill all required values in `.env`.

3) Generate Prisma client and migrate

```bash
npm run prisma:generate
npm run prisma:migrate
```

4) Run app

```bash
npm run dev
```

## Core Endpoints

- Auth:
  - `GET /api/auth/login-url`
  - `GET /api/auth/callback`
  - `GET /api/auth/status`
  - `POST /api/auth/logout`
- Strategy:
  - `POST /api/strategy/start`
  - `POST /api/strategy/stop`
  - `GET /api/strategy/state`
  - `POST /api/strategy/run-entry`
  - `POST /api/strategy/run-risk-check`
  - `POST /api/strategy/run-exit`
  - `POST /api/strategy/refresh-instruments`
- Trading:
  - `POST /api/trade/execute`
  - `POST /api/trade/exit`
- Monitoring:
  - `GET /api/positions`
  - `GET /api/orders`
  - `GET /api/risk/summary`
  - `GET /api/logs`
  - `GET /api/stream`

## Scheduler

Hobby Vercel plans do not allow high-frequency cron.  
Use an external scheduler (GitHub Actions cron, cron-job.org, or your VPS cron) to call:

- `POST /api/strategy/run-entry`
- `POST /api/strategy/run-risk-check`
- `POST /api/strategy/run-exit`

Include one of:

- `x-internal-cron-secret: <INTERNAL_CRON_SECRET>`
- `Authorization: Bearer <INTERNAL_CRON_SECRET>`

## Testing

```bash
npm run test
```

## Notes

- This code handles production engineering concerns but live trading still requires strong operational controls, broker policy checks, and compliance review.
- Validate lot sizes, contract filters, and exchange timings before live use.
