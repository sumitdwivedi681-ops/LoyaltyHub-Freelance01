# Authentication Flow — LoyaltyHub

## Overview

LoyaltyHub uses JWT-based authentication with:
- **Access Tokens** — Short-lived (15 min), sent in Authorization header
- **Refresh Tokens** — Long-lived (7 days), used to get new access tokens
- **bcrypt** — Password hashing with 12 salt rounds

---

## Registration Flow

```
Client → POST /auth/register
  ↓
NestJS validates DTO (class-validator)
  ↓
Check email uniqueness
  ↓
Hash password with bcrypt (12 rounds)
  ↓
Create User record
  ↓
IF CUSTOMER → Create LoyaltyPoints wallet
IF MERCHANT → Create Merchant record
  ↓
Handle referral code (optional) → Award 100 pts to referrer
  ↓
Generate Access Token + Refresh Token (JWT)
  ↓
Return { user, accessToken, refreshToken }
```

---

## Login Flow

```
Client → POST /auth/login { email, password }
  ↓
Find user by email
  ↓
bcrypt.compare(password, hash)
  ↓
Check isActive === true
  ↓
Generate Access Token + Refresh Token
  ↓
Return { user, accessToken, refreshToken }
```

---

## Protected Route Flow

```
Client → GET /loyalty/wallet
         Authorization: Bearer <accessToken>
  ↓
JwtAuthGuard → JwtStrategy validates token
  ↓
Attach user payload to request (id, email, role)
  ↓
RolesGuard checks required roles vs user.role
  ↓
Controller method executes
```

---

## Token Refresh Flow

```
Client receives 401 on API call
  ↓
Axios interceptor catches 401
  ↓
POST /auth/refresh { refreshToken }
  ↓
Backend verifies refreshToken with JWT_REFRESH_SECRET
  ↓
Generate new access + refresh tokens
  ↓
Client retries original request with new token
```

---

## Password Reset Flow

```
Client → POST /auth/forgot-password { email }
  ↓
Backend generates UUID token
  ↓
Stores in PasswordReset table (expires in 1 hour)
  ↓
Sends email with reset link (TODO: email service)
  ↓
Client → POST /auth/reset-password { token, newPassword }
  ↓
Backend validates token (exists, not used, not expired)
  ↓
Hash new password and update User record
  ↓
Mark PasswordReset as used
```

---

## JWT Payload Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "CUSTOMER",
  "iat": 1234567890,
  "exp": 1234568790
}
```

---

## Role-Based Access

| Role | Access |
|---|---|
| `CUSTOMER` | Wallet, Transactions, Rewards, Offers, Coupons, Referral |
| `MERCHANT` | + Dashboard, Customers, Manage Rewards/Promotions/Coupons, Analytics |
| `SUPER_ADMIN` | + Platform Stats, All Merchants, All Users |

---

## Frontend Token Storage

Tokens are stored in `localStorage`:
- `localStorage.getItem('accessToken')`
- `localStorage.getItem('refreshToken')`

On app load, if an access token exists, `/auth/me` is called to restore the session.
On logout, both tokens are cleared and user is redirected to `/login`.
