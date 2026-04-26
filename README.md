# Support Office — FHG & Neolife Attendance System

A production-grade attendance management web application for tracking daily attendance of members at the FHG & Neolife Support Office. Built with Next.js 14 (App Router), Supabase, Tailwind CSS, and shadcn/ui.

## Features

- **Three roles** — Admin, Team Leader, Member — each with role-aware navigation, permissions, and Supabase RLS.
- **Personal QR codes** — every member gets a downloadable QR code that encodes their UUID.
- **QR check-in** — members scan their code on a phone or tablet to mark today's attendance.
- **Today's attendance** — admins and leaders see a live, real-time view of who's in and who's missing (Supabase Realtime).
- **Member management** — admins create members, reset passwords, edit roles/teams, and toggle activation.
- **Reports** — date-range bar/line charts, member breakdown table, and styled Excel export (SheetJS).
- **WhatsApp via Twilio** — daily summary to admins/leaders, and per-check-in confirmations to members.

## Tech Stack

| Concern         | Choice                                                |
| --------------- | ----------------------------------------------------- |
| Framework       | Next.js 14 (App Router) + TypeScript                  |
| Styling         | Tailwind CSS + shadcn/ui                              |
| Auth & DB       | Supabase (PostgreSQL + Auth + RLS)                    |
| Realtime        | Supabase Realtime                                     |
| QR generation   | `qrcode.react`                                        |
| QR scanning     | `html5-qrcode`                                        |
| Excel export    | `xlsx` (SheetJS)                                      |
| WhatsApp        | Twilio                                                |
| Charts          | `recharts`                                            |
| Forms           | `react-hook-form` + `zod`                             |
| Animations      | `framer-motion`                                       |
| Toasts          | `sonner`                                              |
| Hosting         | Vercel                                                |

---

## Quick Start

### 1. Clone & install

```bash
git clone <repo-url>
cd support-office
npm install
```

### 2. Configure Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. In the SQL editor, paste and run [`supabase/schema.sql`](./supabase/schema.sql).
3. In **Authentication → Providers**, ensure **Email** is enabled and turn off "Confirm email" if you want admin-created accounts to log in immediately (the seed script already auto-confirms them).
4. Copy your project URL, `anon` key, and `service_role` key from **Project Settings → API**.

### 3. Configure environment variables

Copy the example file and fill in values:

```bash
cp .env.local.example .env.local
```

| Variable                         | Where to get it                                                |
| -------------------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | Supabase → Project Settings → API → URL                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Supabase → Project Settings → API → `anon` `public`            |
| `SUPABASE_SERVICE_ROLE_KEY`      | Supabase → Project Settings → API → `service_role` (server only) |
| `TWILIO_ACCOUNT_SID`             | Twilio Console → Account SID                                   |
| `TWILIO_AUTH_TOKEN`              | Twilio Console → Auth Token                                    |
| `TWILIO_WHATSAPP_FROM`           | The WhatsApp-enabled Twilio number, e.g. `whatsapp:+14155238886` |
| `NEXT_PUBLIC_APP_URL`            | Public URL of your app, e.g. `https://support-office.vercel.app` |

### 4. Create the first admin (one-time)

You have **three** ways to create your initial admin account. Pick whichever fits your workflow.

**Option A — `/admin-setup` page (browser, one-time)**

Start the dev server (`npm run dev`) and visit [http://localhost:3000/admin-setup](http://localhost:3000/admin-setup). You'll see a one-time form that creates the very first admin. As soon as one admin exists in the database, this route permanently redirects to `/login`. After running it once, you should disable or delete `app/admin-setup/` for extra safety (or block it at the edge).

**Option B — `npx ts-node scripts/create-admin.ts`**

```bash
# interactive (you'll be prompted for each field)
npx ts-node scripts/create-admin.ts

# or via the npm script (uses tsx, same effect)
npm run create-admin

# fully non-interactive via env vars
ADMIN_FULL_NAME="Amara Okafor" \
ADMIN_EMAIL="admin@supportoffice.ng" \
ADMIN_PASSWORD="SuperSecret#2026" \
npm run create-admin

# fully non-interactive via flags
npx ts-node scripts/create-admin.ts \
  --name "Amara Okafor" \
  --email admin@supportoffice.ng \
  --password "SuperSecret#2026"
```

The script reads `.env.local` automatically, calls `supabase.auth.admin.createUser({ email_confirm: true })`, upserts a `profiles` row with `role = 'admin'`, and prints the new user ID to the console.

**Option C — full demo seed (admin + leaders + members + 14 days of attendance)**

```bash
npm run seed
```

Default admin login from the seed script: `admin@supportoffice.ng` / `Admin@12345`.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

### 6. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

In the Vercel dashboard, copy your `.env.local` values into **Project Settings → Environment Variables**. The repo includes a [`vercel.json`](./vercel.json) that pins the deployment to the `lhr1` (London) region.

---

## Project Structure

```
support-office/
├── app/
│   ├── layout.tsx                      Root layout (Inter font + Toaster)
│   ├── page.tsx                        Redirects to /login
│   ├── login/page.tsx                  Email + password sign-in
│   ├── dashboard/
│   │   ├── layout.tsx                  Sidebar + ErrorBoundary wrapper
│   │   ├── page.tsx                    Role-aware home redirect
│   │   ├── attendance/                 Member QR check-in + history
│   │   ├── today/                      Live presence list (admin/leader)
│   │   ├── members/                    Admin CRUD + slide-over forms
│   │   ├── reports/                    Charts, table, Excel export
│   │   └── profile/                    Personal profile & QR
│   └── api/
│       ├── checkin/route.ts            POST: validate scan + insert attendance
│       ├── whatsapp/route.ts           POST: summary or personal WhatsApp send
│       ├── members/route.ts            POST/PATCH: admin user mgmt (service role)
│       └── export/route.ts             GET: Excel report download
├── components/
│   ├── ui/                             shadcn/ui primitives
│   ├── Sidebar.tsx, Topbar.tsx
│   ├── QRCodeDisplay.tsx, QRScanner.tsx
│   ├── AttendanceTable.tsx, MemberCard.tsx, StatsCard.tsx
│   ├── ExportButton.tsx, ErrorBoundary.tsx
├── lib/
│   ├── supabase/{client,server,middleware}.ts
│   ├── queries/{profiles,attendance}.ts
│   ├── utils.ts, validations.ts, whatsapp.ts
├── types/index.ts                      Profile, Attendance, Role, Stats…
├── middleware.ts                       Auth guard + role-aware redirects
├── scripts/seed.ts                     Demo data seeder
├── supabase/schema.sql                 Tables, indexes, RLS policies
├── vercel.json                         Region pin + build config
└── .env.local.example
```

---

## Authentication & Authorization

- Sessions are persisted via Supabase SSR cookies (`@supabase/ssr`).
- [`middleware.ts`](./middleware.ts) protects every `/dashboard/*` route. Unauthenticated users are redirected to `/login`. Authenticated users hitting `/login` are redirected to their role-aware home (`/dashboard/today` for admin & leader, `/dashboard/attendance` for members).
- All Supabase queries from the browser run with the user's RLS context. The `service_role` key is **only** used in server route handlers (`app/api/...`) for admin-only operations.

---

## WhatsApp via Twilio

- The "Send Summary" button on `/dashboard/today` (admin only) calls `POST /api/whatsapp` with `{ type: "summary" }`. The route loops over every active profile that has `phone_whatsapp` and `role in ('admin','leader')` and sends them today's summary via Twilio.
- Personal check-in confirmations are sent automatically (fire-and-forget) when a member checks in via `POST /api/checkin`, provided their `phone_whatsapp` is set.
- For development, use Twilio's [WhatsApp Sandbox](https://www.twilio.com/console/sms/whatsapp/sandbox). Members must send the sandbox join code to your sandbox number once before they can receive messages.

---

## Excel Export

`GET /api/export?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` returns an `.xlsx` file with two sheets:

1. **Summary** — title row, date range, top metrics, and one row per active member with conditional formatting on the attendance % cell (green > 70%, amber 40–70%, red < 40%).
2. **Raw Data** — every individual check-in row: member, username, team, date, time, method.

The endpoint is admin-only and respects the same RLS-aware session as the rest of the app.

---

## Development Notes

- All forms validate via `zod` schemas in [`lib/validations.ts`](./lib/validations.ts).
- Database access lives in [`lib/queries/`](./lib/queries) — never inline in components.
- Loading states use `Skeleton` and `Spinner` components from `components/ui`.
- The dashboard is wrapped in an `ErrorBoundary` so a thrown error renders a friendly retry view instead of crashing the layout.
- Designed and tested at 375px, 768px, and 1280px breakpoints. The sidebar collapses to a bottom navigation on mobile.

---

## License

Built for FHG (Fait'Heroic Generation) & Neolife. Internal use.
