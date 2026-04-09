# IEEE BRACU Student Branch — Membership Portal

A full-stack Next.js membership management system for IEEE BRACU Student Branch.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Auth | Better Auth |
| Database | MongoDB + Mongoose |
| File Upload | Cloudinary |
| Email | Google SMTP via Nodemailer |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |

---

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo>
cd ieee-bracu
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g. `http://localhost:3000`) |
| `BETTER_AUTH_SECRET` | Random secret, min 32 chars |
| `BETTER_AUTH_URL` | Same as app URL |
| `MONGODB_URI` | MongoDB connection string |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASSWORD` | Gmail App Password (not your Gmail password) |
| `SMTP_FROM` | Display name + email |

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App passwords. Generate one for "Mail".

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Creating Your First Admin

1. Register a normal account on the platform
2. Run the admin promotion script:

```bash
npx tsx scripts/make-admin.ts your@email.com
```

3. Sign out and sign back in — you'll now see the **Admin Access** section in the sidebar.

---

## Membership Pricing

All pricing is configured in `src/lib/membership-config.json`.

```json
{
  "chapters": [
    {
      "id": "computer_society",
      "prices": { "new": 1500, "renew": 1200, "extend": 800 }
    }
  ],
  "ieeeMembershipFee": { "new": 3000, "renew": 2500 }
}
```

Edit this file to update prices — no code changes needed.

Payment details (bKash number, bank account) are also in this file.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/      # Better Auth handler
│   │   ├── upload/             # Cloudinary upload
│   │   ├── membership/         # Submit & fetch applications
│   │   └── admin/
│   │       ├── members/        # Admin: list members
│   │       └── applications/   # Admin: list + update applications
│   │           └── [id]/       # Admin: update single application
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   └── dashboard/
│       ├── page.tsx            # Dashboard home
│       ├── membership/         # Membership management
│       ├── projects/           # Placeholder
│       ├── settings/           # Profile view
│       └── admin/
│           ├── members/        # Admin: members list
│           └── applications/   # Admin: applications + status update
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   └── membership/
│       └── MembershipModal.tsx # New / Renew / Extend flows
├── lib/
│   ├── auth.ts                 # Better Auth server config
│   ├── auth-client.ts          # Better Auth client
│   ├── db.ts                   # MongoDB connection
│   ├── cloudinary.ts           # Cloudinary upload helper
│   ├── mailer.ts               # Nodemailer / SMTP
│   ├── utils.ts                # cn(), formatCurrency(), DEPARTMENTS
│   ├── require-admin.ts        # Server-side admin guard
│   └── membership-config.json  # ← Edit prices & payment info here
├── models/
│   ├── User.ts
│   └── MembershipApplication.ts
└── types/
    └── index.ts
```

---

## Features

### Student
- Register with full profile (ID card upload to Cloudinary)
- Login / logout
- Dashboard with application summary
- **Membership page**:
  - View current chapter memberships (CS, RAS, EDS)
  - **Buy New Membership** — IEEE account check, chapter selection, price calc, bKash/Bank payment
  - **Renew Membership** — same flow with renewal pricing
  - **Extend Chapters** — member type selection (new/existing), extend pricing
  - Application history with status (Pending / Approved / Rejected)

### Admin
- All student features
- **Members** — search & view all registered students with full profile
- **Applications** — view all membership applications merged with student info
  - Update status: Pending → Approved / Rejected
  - Add admin notes

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

### MongoDB Atlas

Use a free M0 cluster at [mongodb.com/atlas](https://mongodb.com/atlas). Copy the connection string to `MONGODB_URI`.

---

## Security Notes

- IEEE account passwords submitted by students are stored **as plain text** in the current implementation. In production, encrypt them using a library like `node-forge` or store them in a separate encrypted field.
- File uploads are validated by MIME type and size (max 5MB) before being sent to Cloudinary.
- Admin routes are protected server-side via `requireAdminPage()` (layout) and role checks in each API route.
# ieee-web
