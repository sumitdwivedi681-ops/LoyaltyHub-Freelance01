# Loyalty Management System — Full-Stack Implementation Plan

## Overview

A SaaS-style **Loyalty Management Platform** built with Next.js (frontend) and NestJS (backend), using PostgreSQL via Prisma ORM. The platform serves three roles: **Customer**, **Merchant/Admin**, and **Super Admin**.

---

## User Review Required

> [!IMPORTANT]
> This is a large, multi-phase project. The plan is broken into **Phase 1 (Core)** and **Phase 2 (Advanced)** to deliver a working MVP first before adding premium features.

> [!WARNING]
> **Google Login** requires OAuth credentials (Google Cloud Console). I'll scaffold the code but you'll need to provide the Client ID/Secret from your Google Cloud Console.

> [!WARNING]
> **Razorpay/Stripe** payment integration requires API keys. The scaffold will be included but the keys must be set in environment variables.

> [!IMPORTANT]
> **Firebase Push Notifications** requires a Firebase project. The service worker scaffold will be included but config must be provided.

> [!NOTE]
> The project will be organized as a **monorepo** with two top-level directories: `frontend/` and `backend/`, placed inside `c:\Users\Admin\OneDrive\Desktop\freelance01\loyalty-system\`.

---

## Open Questions

> [!IMPORTANT]
> 1. **Database Hosting**: The spec says Supabase PostgreSQL. Should I include Supabase-specific config, or just standard PostgreSQL (which works on any host including Supabase)?
> 2. **Email Provider**: Should I scaffold with **NodeMailer + SMTP** (works with Gmail/SendGrid), or do you have a preferred provider?
> 3. **Currency**: Should the points/rewards system be currency-agnostic, or tuned for INR (Razorpay implies India)?
> 4. **Phase Preference**: Do you want everything in one go, or Phase 1 (full working MVP) first and then Phase 2 (AI, gamification, geo-targeting)?

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│  Next.js 14 App Router + Tailwind CSS + TypeScript       │
│  PWA (Service Worker + App Manifest)                     │
│  Roles: Customer | Merchant | Super Admin                │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST API
┌────────────────────────▼────────────────────────────────┐
│                     API LAYER                            │
│  NestJS + JWT Auth + Role Guards + Rate Limiting         │
│  Modules: Auth | User | Merchant | Loyalty | Analytics   │
└────────────────────────┬────────────────────────────────┘
                         │ Prisma ORM
┌────────────────────────▼────────────────────────────────┐
│                   DATABASE LAYER                         │
│  PostgreSQL (Supabase)                                   │
│  Tables: Users, Merchants, LoyaltyPoints, Transactions,  │
│          Rewards, Promotions, Coupons, Badges, Tiers     │
└─────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
loyalty-system/
├── frontend/                  # Next.js 14 App
│   ├── app/
│   │   ├── (auth)/           # Login, Register, Forgot Password
│   │   ├── (customer)/       # Customer dashboard pages
│   │   ├── (merchant)/       # Merchant dashboard pages
│   │   ├── (admin)/          # Super admin pages
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/               # Reusable UI (Button, Card, Modal, Badge)
│   │   ├── auth/             # Auth forms
│   │   ├── customer/         # Customer-specific components
│   │   ├── merchant/         # Merchant-specific components
│   │   └── admin/            # Admin-specific components
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API service layer (Axios)
│   ├── context/              # Auth context, Theme context
│   ├── utils/                # Helpers, formatters, validators
│   ├── styles/               # Global CSS (Tailwind base)
│   ├── public/
│   │   ├── manifest.json     # PWA manifest
│   │   └── icons/            # PWA icons
│   └── next.config.js        # PWA config (next-pwa)
│
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── auth/             # Auth module (JWT, Guards, Strategies)
│   │   ├── users/            # User module (CRUD, profile)
│   │   ├── merchants/        # Merchant module
│   │   ├── loyalty/          # Points engine, wallet, redemption
│   │   ├── rewards/          # Rewards catalog management
│   │   ├── promotions/       # Promotions & campaigns
│   │   ├── coupons/          # Coupon generation & QR codes
│   │   ├── analytics/        # Reporting & dashboards
│   │   ├── notifications/    # Push/email notifications
│   │   ├── prisma/           # Prisma service
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma     # Full DB schema
│   └── .env.example
│
├── docs/
│   ├── API.md                # Full API documentation
│   ├── ER_DIAGRAM.md         # Entity relationship diagram
│   ├── AUTH_FLOW.md          # Authentication flow
│   ├── DEPLOYMENT.md         # Deployment guide
│   └── SETUP.md              # Environment setup
│
└── README.md
```

---

## Proposed Changes

### Phase 1 — Core MVP

---

### Backend — NestJS API

#### [NEW] `backend/prisma/schema.prisma`
Full Prisma schema with all 9 models:
- `User` (id, name, email, password, role, tier, referral_code, created_at)
- `Merchant` (id, store_name, owner_id, address, logo, created_at)
- `LoyaltyPoints` (id, user_id, points, lifetime_points, updated_at)
- `Transaction` (id, customer_id, merchant_id, purchase_amount, points_earned, type, created_at)
- `Reward` (id, merchant_id, name, description, required_points, expiry_date, stock)
- `Promotion` (id, merchant_id, title, description, discount, expiry_date, active)
- `Coupon` (id, code, customer_id, merchant_id, reward_id, redeemed_status, redeemed_at)
- `Badge` (id, user_id, name, icon, earned_at)
- `Referral` (id, referrer_id, referee_id, points_awarded, created_at)

#### [NEW] `backend/src/auth/` module
- JWT strategy + Refresh Token
- bcrypt password hashing
- Role-based guards (CUSTOMER, MERCHANT, SUPER_ADMIN)
- Google OAuth scaffold

#### [NEW] `backend/src/loyalty/` module
- Points engine (earn on purchase)
- Wallet endpoint
- Tier calculation (Silver/Gold/Platinum thresholds)
- Redemption logic with validation

#### [NEW] `backend/src/analytics/` module
- Merchant dashboard stats
- Platform-level stats (admin)
- Chart data endpoints

#### [NEW] `backend/src/coupons/` module
- Generate coupon code
- QR code generation (using `qrcode` npm package)
- Verify/redeem coupon

---

### Frontend — Next.js 14

#### [NEW] `frontend/app/(auth)/` pages
- `/login` — JWT + Google Login button
- `/register` — Customer & Merchant registration
- `/forgot-password` — Email-based reset flow

#### [NEW] `frontend/app/(customer)/` pages
- `/dashboard` — Points wallet, tier badge, recent activity
- `/wallet` — Full transaction history with filters
- `/rewards` — Rewards catalog with redeem button
- `/offers` — Personalized promotions
- `/scan` — QR scanner (camera-based)
- `/referral` — Referral link + status

#### [NEW] `frontend/app/(merchant)/` pages
- `/dashboard` — Analytics overview (charts)
- `/customers` — Customer list + search + export
- `/rewards` — Create/edit/delete rewards
- `/promotions` — Campaign management
- `/coupons` — Generate coupons, QR codes
- `/reports` — Sales reports with export (CSV)
- `/loyalty-rules` — Configure points per dollar rules

#### [NEW] `frontend/app/(admin)/` pages
- `/dashboard` — Platform analytics
- `/merchants` — Manage all merchants
- `/users` — Manage all users
- `/subscriptions` — Plan management

#### [NEW] `frontend/components/ui/`
- `Button`, `Card`, `Badge`, `Modal`, `Toast`
- `Skeleton` (loading states)
- `DataTable`, `Chart` (Recharts)
- `QRScanner`, `QRDisplay`
- `ThemeToggle` (Dark/Light)

#### [NEW] PWA files
- `public/manifest.json`
- `public/sw.js` (service worker via next-pwa)
- App install prompt banner component

---

### Database Schema (ER Summary)

```
Users ──< LoyaltyPoints (1:1)
Users ──< Transactions (1:N, as customer)
Users ──< Coupons (1:N)
Users ──< Badges (1:N)
Merchants ──< Transactions (1:N)
Merchants ──< Rewards (1:N)
Merchants ──< Promotions (1:N)
Merchants ──< Coupons (1:N)
Rewards ──< Coupons (1:N)
```

---

### Documentation

#### [NEW] `docs/API.md`
All REST endpoints with request/response examples.

#### [NEW] `docs/ER_DIAGRAM.md`
Mermaid ER diagram for all tables.

#### [NEW] `docs/DEPLOYMENT.md`
- Frontend → Vercel (env vars, build config)
- Backend → Render/Railway (Dockerfile, env vars)
- Database → Supabase (connection string)

#### [NEW] `README.md`
Full project README with setup, tech stack, features, and screenshots.

---

### Phase 2 — Advanced Features (Post-MVP)

| Feature | Implementation |
|---|---|
| AI Recommendations | OpenAI API or simple collaborative filtering |
| Geo-targeted Promotions | Browser Geolocation API + radius check |
| Real-time Notifications | Socket.io or Firebase FCM |
| Gamification Badges | Automatic badge award on milestones |
| Analytics Charts | Recharts with animated transitions |

---

## API Endpoints Summary

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register user |
| POST | `/auth/login` | Public | Login + JWT |
| POST | `/auth/refresh` | Auth | Refresh token |
| POST | `/auth/forgot-password` | Public | Password reset |
| GET | `/loyalty/wallet` | CUSTOMER | Get points wallet |
| POST | `/loyalty/redeem` | CUSTOMER | Redeem reward |
| GET | `/loyalty/transactions` | CUSTOMER | Transaction history |
| GET | `/rewards` | CUSTOMER | Browse rewards |
| POST | `/merchants/rewards` | MERCHANT | Create reward |
| POST | `/merchants/promotions` | MERCHANT | Create promotion |
| POST | `/merchants/coupons/generate` | MERCHANT | Generate coupon |
| GET | `/merchants/customers` | MERCHANT | Manage customers |
| GET | `/merchants/analytics` | MERCHANT | Dashboard stats |
| GET | `/admin/merchants` | SUPER_ADMIN | Manage merchants |
| GET | `/admin/analytics` | SUPER_ADMIN | Platform stats |

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify Next.js compiles without errors
- Run `npm run build` for NestJS backend
- Prisma schema validation: `npx prisma validate`
- API smoke test via browser subagent after dev server start

### Manual Verification
- Visual inspection of all dashboard pages
- Dark/Light mode toggle
- Mobile responsiveness check
- PWA install prompt verification
- JWT flow: register → login → access protected route

---

## Delivery Timeline Estimate

| Phase | Contents | Effort |
|---|---|---|
| Phase 1A | Backend + Prisma schema + Auth | ~40% |
| Phase 1B | Frontend core pages + PWA | ~40% |
| Phase 1C | Docs, README, ER Diagram | ~20% |
| Phase 2 | AI, geo, real-time, gamification | Follow-up |
