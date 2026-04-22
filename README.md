# OpsFlow — DevOps Team Collaboration SaaS

A production-grade full-stack platform for engineering teams to manage **incidents, deployments, alerts, runbooks, tasks, and analytics** — all in one premium dark dashboard.

Built with **React + TypeScript + Tailwind** on the frontend and **Node.js + Express + MongoDB** on the backend, with JWT auth, role-based permissions, and realistic seed data.

---

## Project structure

```
OpsFlow/
├── frontend/          # React + Vite + TS + Tailwind + TanStack Query
│   ├── src/
│   │   ├── api/       # Single facade — swaps mock ↔ real backend via env flag
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/     # Zustand: auth + UI state
│   │   ├── mock/      # In-memory demo data (used when VITE_USE_MOCK=true)
│   │   ├── types/
│   │   └── lib/
│   └── .env.example
└── backend/           # Express + Mongoose
    ├── src/
    │   ├── models/    # 11 Mongoose models
    │   ├── controllers/
    │   ├── routes/
    │   ├── middleware/
    │   ├── validators/
    │   ├── utils/
    │   ├── config/
    │   └── seed/seed.js
    └── .env.example
```

## How frontend ↔ backend ↔ DB connect

Every API call in the frontend goes through **`src/api/index.ts`** — a single facade with two modes:

| Mode | Set by | What happens |
| --- | --- | --- |
| **Mock** (default) | `VITE_USE_MOCK=true` | Uses in-memory demo data. App runs fully without backend. |
| **Live** | `VITE_USE_MOCK=false` + `VITE_API_URL=http://localhost:4000/api` | Calls the Express API. Mongoose reads/writes MongoDB. |

The backend's response shapes are produced by presenters (`backend/src/utils/presenters.js`) that match `frontend/src/types/index.ts` byte-for-byte. **Swapping modes requires zero call-site changes.**

---

## Quick start

### 1. Frontend only (mock mode — no backend needed)

```bash
cd frontend
npm install
cp .env.example .env     # VITE_USE_MOCK=true by default
npm run dev              # http://localhost:5173
```

Log in with any email and a password of 4+ characters. Try `elena.marquez@opsflow.io` / `demo1234`.

### 2. Full stack (real database)

Prereq: MongoDB running locally (or a connection string to Atlas).

```bash
# Backend
cd backend
npm install
cp .env.example .env     # edit MONGODB_URI, JWT_SECRET
npm run seed             # populates users, incidents, alerts, deployments, etc.
npm run dev              # http://localhost:4000
```

```bash
# Frontend
cd frontend
npm install
cp .env.example .env
# Edit .env:
#   VITE_USE_MOCK=false
#   VITE_API_URL=http://localhost:4000/api
npm run dev
```

Seeded accounts (all password `demo1234`):

| Role | Email |
| --- | --- |
| super_admin | `yash.rao@opsflow.io` |
| admin | `elena.marquez@opsflow.io` |
| manager | `daniel.chen@opsflow.io` |
| devops | `priya.shah@opsflow.io` |
| developer | `lina.park@opsflow.io` |
| viewer | `tom.becker@opsflow.io` |

---

## Features

**Authentication** — signup, login, forgot/reset, protected routes, JWT + bcrypt, persistent sessions.

**Role-based permissions** — 6 roles (super_admin, admin, manager, devops, developer, viewer) with per-route checks.

**Dashboard** — live stats, 14-day trend chart, severity mix, activity feed, uptime, MTTR.

**Incidents** — full CRUD, priority/status workflow, comments & timeline, filtering, keyed IDs (`INC-1042`).

**Deployments** — trigger, rollback, per-environment filtering, live logs, success-rate metrics.

**Alerts Center** — acknowledge / mute / resolve, severity & source tracking.

**Team Workspace** — members, roles, teams, task board with drag-free status updates.

**Runbooks** — markdown knowledge base with categories, tags, versioning, full-text search.

**Analytics** — MTTR, incident frequency, deployment success, team workload, top services.

**Notifications** — in-app feed with unread counts & mark-all-read.

**Audit Logs** — every admin action is recorded with actor, IP, and timestamp.

**Settings** — profile, security, 2FA toggle, org branding, session management.

**Polish** — command palette (⌘K / Ctrl-K), skeleton loaders, empty states, 404 page, toasts, Framer Motion animations, fully responsive.

---

## API surface

All endpoints are under `/api`. Auth via `Authorization: Bearer <token>`.

```
POST   /auth/signup
POST   /auth/login
POST   /auth/forgot
POST   /auth/reset
GET    /auth/me

GET    /dashboard

GET    /incidents            ?q=&status=&priority=
GET    /incidents/:id
POST   /incidents
PATCH  /incidents/:id
DELETE /incidents/:id
POST   /incidents/:id/comments

GET    /deployments          ?q=&env=&status=
POST   /deployments
PATCH  /deployments/:id
POST   /deployments/:id/rollback

GET    /alerts               ?q=&severity=&status=
POST   /alerts
PATCH  /alerts/:id

GET    /users
PATCH  /users/:id
GET    /teams
GET    /tasks
POST   /tasks
PATCH  /tasks/:id

GET    /runbooks             ?q=
GET    /runbooks/:id
POST   /runbooks
PATCH  /runbooks/:id
DELETE /runbooks/:id

GET    /notifications
PATCH  /notifications/:id/read
POST   /notifications/read-all

GET    /audit-logs
GET    /analytics
```

---

## Tech stack

**Frontend** · React 18 · TypeScript · Vite · Tailwind CSS · React Router v6 · TanStack Query · Zustand · Framer Motion · Recharts · Lucide icons · React Hot Toast · Axios

**Backend** · Node.js · Express · Mongoose · bcryptjs · jsonwebtoken · Zod (validation) · Helmet · CORS · express-rate-limit · Morgan

**Database** · MongoDB (11 collections: users, teams, incidents, deployments, alerts, tasks, comments, runbooks, notifications, audit_logs, settings)

---

## Deployment

- **Frontend** → Vercel / Netlify. Set `VITE_USE_MOCK=false` and `VITE_API_URL=https://your-api.example.com/api`.
- **Backend** → Render / Railway / Fly.io. Set `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`.
- **Database** → MongoDB Atlas free tier works out of the box.

---

## License

MIT © OpsFlow
