# Support Office — FHG & Neolife Attendance System

The official attendance platform for the **FHG × Neolife Support Office**. Members register, get approved by an admin, then mark daily attendance via QR scan or one-tap. Admins manage members, run reports, and broadcast WhatsApp summaries.

Built with **Next.js 14** (App Router, Server Components, Server Actions), **Supabase** (Postgres + Auth + Realtime + Storage), **Tailwind CSS** + **shadcn/ui**, **Twilio** WhatsApp API, **html5-qrcode**, **qrcode.react**, **xlsx**, **recharts**, **framer-motion**, **react-hook-form** + **zod**, and **sonner**.

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd support-office
npm install
```

### 2. Create the Supabase project

1. Go to <https://supabase.com> and create a new project.
2. In **SQL Editor → New query**, paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and run it.
   - This creates the `profiles`, `attendance`, and `notifications` tables.
   - Enables Row Level Security (RLS) policies.
   - Adds `attendance` to the `supabase_realtime` publication.
   - Creates the public `avatars` storage bucket.
3. From **Project Settings → API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only)

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Twilio WhatsApp (use sandbox while testing)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

NEXT_PUBLIC_APP_URL=http://localhost:3000
SETUP_SECRET_KEY=<long random string>
```

### 4. Run dev

```bash
npm run dev
```

Open <http://localhost:3000>.

### 5. Create the first admin

Navigate to **<http://localhost:3000/setup>**.

This page is only available when **no admin exists**. Fill in the form and provide your `SETUP_SECRET_KEY`. The page will:

1. Create a Supabase Auth user.
2. Insert a profile with `role = 'admin'`, `account_status = 'approved'`.
3. Redirect you to `/login`.

After login, use **Admin → Members → Add Member** to create members directly, or have members register at `/register` (they’ll need admin approval before they can log in).

---

## Vercel Deployment

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Set every variable from `.env.local.example` in **Project Settings → Environment Variables**.
4. The included [`vercel.json`](./vercel.json) pins the deploy region to `lhr1` (London — closest to Nigeria).
5. Update `NEXT_PUBLIC_APP_URL` to your production URL after the first deploy.
6. Deploy.

> **Important:** When changing `NEXT_PUBLIC_APP_URL`, also add the new origin in **Supabase → Authentication → URL Configuration → Site URL / Redirect URLs**.

---

## Twilio WhatsApp (sandbox setup)

For development, the Twilio sandbox is the fastest way to test:

1. Go to **Twilio Console → Messaging → Try it out → Send a WhatsApp message**.
2. Activate the sandbox by sending the join code (e.g. `join silver-fox`) from each member's WhatsApp number to `+1 415 523 8886`.
3. The sandbox number `whatsapp:+14155238886` is the value of `TWILIO_WHATSAPP_FROM`.
4. Account SID and Auth Token come from **Twilio Console → Account info**.

For production, request a Twilio WhatsApp Business sender from a verified Meta Business profile.

---

## Folder Structure

```text
support-office/
├── app/
│   ├── layout.tsx                 root layout (Inter font, Toaster)
│   ├── page.tsx                   landing page
│   ├── login/                     /login
│   ├── register/                  /register (multi-step)
│   ├── pending/                   /pending (awaiting approval)
│   ├── setup/                     /setup (one-time first admin)
│   ├── dashboard/                 member area (auth + approved)
│   │   ├── layout.tsx
│   │   ├── page.tsx               member home
│   │   ├── attendance/            QR + one-click check-in
│   │   ├── history/               personal attendance history
│   │   └── profile/               profile + password change
│   ├── admin/                     admin area (auth + role=admin)
│   │   ├── layout.tsx
│   │   ├── page.tsx               overview + charts + live feed
│   │   ├── members/               member management
│   │   ├── attendance/            today's attendance, mark for others
│   │   ├── reports/               range reports + Excel export
│   │   └── approvals/             pending registration approvals
│   └── api/
│       ├── checkin/route.ts       POST: process QR scan
│       ├── whatsapp/route.ts      POST: dispatch WhatsApp messages (admin)
│       └── export/route.ts        GET:  generate the Excel report
├── components/
│   ├── ui/                        shadcn-style primitives
│   ├── landing/                   marketing-page sections
│   ├── auth/                      LoginForm, RegisterForm, SetupForm
│   ├── dashboard/                 sidebars, topbar, stats card, calendar
│   ├── attendance/                QR display / scanner / check-in button
│   └── admin/                     tables, panels, charts, slide-overs
├── lib/
│   ├── supabase/                  client, server, middleware helpers
│   ├── queries/                   profiles + attendance read functions
│   ├── actions/                   "use server" actions
│   ├── validations.ts             zod schemas
│   ├── utils.ts                   helpers (dates, phone, streaks, cn)
│   └── whatsapp.ts                Twilio message senders
├── types/index.ts                 Profile, AttendanceRecord, etc.
├── middleware.ts                  route protection
├── supabase/schema.sql            full DB schema + RLS + storage
├── vercel.json                    deploy config (region: lhr1)
└── .env.local.example
```

---

## Role Permissions

| Capability                          | Admin | Member |
| ----------------------------------- | :---: | :----: |
| View landing / login / register     |  ✅   |   ✅   |
| Register a new account              |  —    |   ✅   |
| Approve / reject member accounts    |  ✅   |   —    |
| Add member directly (auto-approved) |  ✅   |   —    |
| Edit any member’s profile           |  ✅   |   —    |
| Delete a member                     |  ✅   |   —    |
| View own attendance                 |  ✅   |   ✅   |
| View all members' attendance        |  ✅   |   —    |
| Mark own attendance (manual / QR)   |  ✅   |   ✅   |
| Mark another member's attendance    |  ✅   |   —    |
| View charts & reports               |  ✅   |   —    |
| Export attendance to Excel          |  ✅   |   —    |
| Send WhatsApp daily summary         |  ✅   |   —    |
| Receive WhatsApp on approve / scan  |  —    |   ✅   |

---

## How attendance is marked

1. **Self-service one-click** (member): tap **Mark Present** on `/dashboard` or `/dashboard/attendance`. Attendance row inserted with `method = 'manual'`.
2. **QR self-scan** (member or admin scans member QR): the scanner page POSTs `{ scanned_user_id }` to `/api/checkin`. Server validates the scanned user is `approved`, prevents duplicates, inserts `method = 'qr'`, and sends a WhatsApp confirmation.
3. **Admin override**: from `/admin/attendance`, tap **Mark Present** beside any absent member. Inserts `method = 'admin'` with `marked_by` set.

The `attendance` table has `unique(user_id, date)` to guarantee a single check-in per day.

---

## Realtime

The `attendance` table is part of `supabase_realtime`. The admin overview page subscribes via `supabase.channel(...)` to stream new check-ins to the **Live Check-Ins** feed, and the **Today’s Attendance** page auto-refreshes when admins mark members present elsewhere.

---

## Troubleshooting

- **`auth.users` row exists but `profiles` does not** — usually means the registration insert failed. Check the **Logs** tab in Supabase. RLS allows users to insert their own profile; the registration server action also retries via the service-role client.
- **Twilio messages not sending** — check that members joined the sandbox (or that your sender is approved for production), and that `TWILIO_WHATSAPP_FROM` is the exact `whatsapp:+...` form.
- **Setup page redirects to login** — that’s expected once any admin exists. To re-allow `/setup`, delete the admin profile (and the matching auth user) from Supabase.
- **QR scanner fails on iOS Safari** — the page must be served over HTTPS for camera access. Vercel handles that automatically.

---

© FHG & Neolife Support Office. Built with care.
