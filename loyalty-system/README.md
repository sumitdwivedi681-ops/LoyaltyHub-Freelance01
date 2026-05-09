# LoyaltyHub — Full-Stack Loyalty Management System

<div align="center">
  <h3>💎 Earn. Redeem. Reward.</h3>
  <p>A modern SaaS loyalty platform for customers and merchants — built with Next.js, NestJS, and PostgreSQL.</p>
</div>

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| **Backend** | NestJS, TypeScript, REST API |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma |
| **Auth** | JWT (Access + Refresh Tokens), bcrypt |
| **PWA** | next-pwa, Service Workers, Web App Manifest |
| **Charts** | Recharts |
| **QR Codes** | qrcode.react, qrcode (server-side) |

---

## 📁 Project Structure

```
loyalty-system/
├── frontend/          # Next.js 14 App
│   ├── src/app/
│   │   ├── (auth)/   # Login, Register, Forgot Password
│   │   ├── customer/ # Customer dashboard (6 pages)
│   │   ├── merchant/ # Merchant dashboard (7 pages)
│   │   └── admin/    # Super Admin (3 pages)
│   ├── src/components/
│   ├── src/services/  # API service layer
│   └── src/context/   # Auth context
│
├── backend/           # NestJS API
│   ├── src/
│   │   ├── auth/      # JWT Auth, Guards, Strategies
│   │   ├── users/     # User management
│   │   ├── merchants/ # Merchant management
│   │   ├── loyalty/   # Points engine, wallet, tiers
│   │   ├── rewards/   # Reward catalog
│   │   ├── promotions/# Campaign management
│   │   ├── coupons/   # Coupon generation + QR
│   │   ├── analytics/ # Dashboard analytics
│   │   └── prisma/    # Prisma service
│   └── prisma/
│       └── schema.prisma
│
└── docs/
    ├── API.md
    ├── ER_DIAGRAM.md
    ├── DEPLOYMENT.md
    ├── AUTH_FLOW.md
    └── SETUP.md
```

---

## 🎯 Features

### Customer
- 💰 Points Wallet with tier tracking (Bronze → Silver → Gold → Platinum)
- 🎁 Rewards Catalog with one-click redemption
- 🎫 Digital Coupons with QR code display
- 📊 Full Transaction History
- 🔥 Personalized Offers & Promotions
- 🤝 Referral Program (earn 100 pts per referral)
- 🏆 Gamification Badges
- 📱 PWA — installable on mobile

### Merchant
- 📊 Analytics Dashboard with Recharts charts
- 👥 Customer Management with search
- 🎁 Rewards CRUD
- 📢 Promotions & Campaigns CRUD
- 🎫 Coupon Generator + QR Code
- ⭐ Award Points interface
- 🏪 Store Profile Management

### Super Admin
- 🌐 Platform-wide analytics
- 🏪 Merchant management
- 👥 User management

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or Supabase)
- npm

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT secrets

npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local with your API URL

npm install
npm run dev
```

### 3. Access

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api/v1 |
| API Health | http://localhost:3001/api/v1 |

---

## 🔑 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## 🗃️ Database Models

- **User** — Customers, Merchants, Super Admins
- **Merchant** — Store information, points configuration
- **LoyaltyPoints** — Wallet with tier tracking
- **Transaction** — Points history (EARN/REDEEM/REFERRAL)
- **Reward** — Merchant reward catalog
- **Promotion** — Marketing campaigns
- **Coupon** — Generated from reward redemptions
- **Badge** — Gamification achievements
- **Referral** — Referral tracking
- **LoyaltyRule** — Custom merchant point rules
- **PasswordReset** — Secure password reset tokens

---

## 🚀 Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full instructions.

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render / Railway |
| Database | Supabase PostgreSQL |

---

## 📖 API Documentation

See [docs/API.md](docs/API.md) for all endpoints.

---

## 📊 Tier System

| Tier | Lifetime Points | Multiplier |
|---|---|---|
| 🥉 Bronze | 0 - 999 | 1x |
| 🥈 Silver | 1,000 - 4,999 | 1.25x |
| 🥇 Gold | 5,000 - 14,999 | 1.5x |
| 💎 Platinum | 15,000+ | 2x |

---

## 🔒 Security

- JWT access tokens (15min) + refresh tokens (7d)
- bcrypt password hashing (12 rounds)
- Rate limiting (100 req/min via @nestjs/throttler)
- Helmet.js security headers
- Role-based access control (CUSTOMER / MERCHANT / SUPER_ADMIN)
- Input validation via class-validator

---

## 📱 PWA

LoyaltyHub is a Progressive Web App:
- ✅ Installable on Android/iOS home screen
- ✅ Service worker for offline support
- ✅ App manifest with theme colors
- ✅ Mobile-first responsive design

---

## 📄 License

MIT © LoyaltyHub
