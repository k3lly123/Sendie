# Sendie

Sendie is a merchant shipping dashboard built with React, TypeScript, Tailwind CSS, Motion, Express, and PostgreSQL. It includes authentication, order management, customer tracking, billing, API key management, and public tracking pages.

## Prerequisites

- Node.js 20 or later
- PostgreSQL database
- npm

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template:
   ```bash
   copy .env.example .env
   ```
3. Update `DIRECT_URL` and `DATABASE_URL` in `.env` to point at your PostgreSQL database.
4. Add your Flutterwave keys if you want real hosted checkout:
   - `FLUTTERWAVE_SECRET_KEY`
   - `FLUTTERWAVE_SECRET_HASH`
   - `APP_URL`
   - `SENDIE_PAYMENT_PROVIDER=flutterwave`
5. Create the Prisma client and push the schema:
   ```bash
   npm run db:generate
   npm run db:push
   ```

## Run locally

Start the frontend:
```bash
npm run dev
```

Start the API in a second terminal:
```bash
npm run dev:api
```

The frontend runs on `http://localhost:3000` and proxies API requests to `http://localhost:4000`.

## Build

```bash
npm run build
```

## Notes

- The backend stores Sendie workspace state in PostgreSQL through Prisma.
- Prisma manages the Postgres connection and the `app_state` table.
- Billing uses hosted Flutterwave checkout, transaction verification, and webhooks when the provider keys are configured.
- AltixPay is scaffolded as a future adapter, but Flutterwave is the active payment path.
- `npm run lint` runs the TypeScript check for the frontend.
