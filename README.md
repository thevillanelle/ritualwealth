# Ritualwealth

**Part of the [Ritualware Suite](https://ritualware.app)**

A FIRE (Financial Independence, Retire Early) quiz suite. Five quizzes help you identify your FIRE type, career alignment, home base goals, creative ambitions, and risk tolerance. Results combine into a personalized financial independence roadmap.

## What it does

- **5 FIRE quizzes**: fire_type, career, home, creative, risk
- Results are saved per-quiz and aggregated into a `user_fire_plans` profile
- Unauthenticated results are held in `localStorage` and flushed on sign-in

## Who it's for

VILE community members working toward FatFIRE or any flavor of financial independence.

## Run locally

```bash
cp .env.example .env.local   # add your Supabase credentials
npm install
npm run dev
```

## Stack

- Next.js + React
- Zustand (auth + state)
- Supabase (auth, data via `@supabase/ssr`)
- Tailwind CSS
- Deployed on Vercel

## Data

Tables owned by this app: `fire_quiz_results`, `user_fire_plans`.
Robin reads from these tables to populate the Wealth Dashboard.
