# Deployment Guide — LoyaltyHub

## Architecture

```
Internet → Vercel (Frontend) → Render/Railway (NestJS API) → Supabase (PostgreSQL)
```

---

## 1. Database — Supabase PostgreSQL

1. Go to [supabase.com](https://supabase.com) → Create Project
2. Go to **Settings → Database** → Copy the connection string
3. Use the **connection pooling** URI (port 6543) for production:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true
   ```

---

## 2. Backend — Render

### Steps:
1. Push backend code to a GitHub repository
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set root directory: `backend/`
5. Build Command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
6. Start Command: `npm run start:prod`
7. Add Environment Variables:

```env
DATABASE_URL=postgresql://...supabase...
JWT_SECRET=super-strong-random-secret-here
JWT_REFRESH_SECRET=another-strong-random-secret
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
PORT=10000
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

8. Deploy!

---

## 3. Frontend — Vercel

### Steps:
1. Push frontend code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Set root directory: `frontend/`
4. Add Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
NEXT_PUBLIC_APP_NAME=LoyaltyHub
```

5. Deploy!

---

## 4. Alternative: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Set root to `backend/`
4. Add same env vars as Render
5. Railway auto-detects Node.js and runs build scripts

---

## Post-Deployment Checklist

- [ ] Database migrations run successfully (`prisma migrate deploy`)
- [ ] Backend health check: `GET https://your-api.onrender.com/api/v1`
- [ ] Frontend loads at Vercel URL
- [ ] Register flow works end-to-end
- [ ] CORS allows Vercel domain (set FRONTEND_URL env var)
- [ ] JWT tokens are being issued
- [ ] PWA manifest loads correctly

---

## Environment Variables Summary

### Backend (Required)
| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `JWT_SECRET` | Strong random string for access tokens |
| `JWT_REFRESH_SECRET` | Strong random string for refresh tokens |
| `JWT_EXPIRY` | Access token expiry (default: 15m) |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry (default: 7d) |
| `PORT` | Server port (Render uses 10000) |
| `FRONTEND_URL` | Vercel app URL for CORS |

### Frontend (Required)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

### Optional
| Variable | Description |
|---|---|
| `SMTP_HOST/PORT/USER/PASS` | Email for password reset |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth login |
| `RAZORPAY_KEY_ID/SECRET` | Razorpay payments |
| `STRIPE_SECRET_KEY` | Stripe payments |
