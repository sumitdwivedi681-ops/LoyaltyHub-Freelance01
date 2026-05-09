# Environment Setup Guide

## 1. Node.js & Database
- Install Node.js (v18+)
- Install PostgreSQL locally, or set up a cloud instance like [Supabase](https://supabase.com/).

## 2. Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend` folder:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/loyalty?schema=public"
JWT_SECRET="generate-a-strong-secret-key-here"
JWT_REFRESH_SECRET="generate-another-strong-secret-here"
JWT_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Frontend (`frontend/.env.local`)
Create a `.env.local` file in the `frontend` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=LoyaltyHub
```

## 3. Database Migration
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
```

## 4. Run Development Servers
**Backend:**
```bash
cd backend
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Both should now be running!
