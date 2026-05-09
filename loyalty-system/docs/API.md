# LoyaltyHub API Documentation

Base URL: `http://localhost:3001/api/v1`

All protected endpoints require: `Authorization: Bearer <accessToken>`

---

## 🔐 Auth Endpoints

### POST /auth/register
Register a new user.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+91-9876543210",
  "role": "CUSTOMER",
  "referralCode": "ABC12345"
}
```

**Response 201:**
```json
{
  "user": { "id": "uuid", "name": "John Doe", "email": "...", "role": "CUSTOMER" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### POST /auth/login
```json
{ "email": "john@example.com", "password": "password123" }
```

**Response 200:**
```json
{
  "user": { ... },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### POST /auth/refresh
```json
{ "refreshToken": "eyJ..." }
```

---

### POST /auth/forgot-password
```json
{ "email": "john@example.com" }
```

---

### POST /auth/reset-password
```json
{ "token": "reset-uuid", "newPassword": "newpassword123" }
```

---

### GET /auth/me
Returns current user profile with loyalty points and merchant data.

---

## 💰 Loyalty Endpoints

### GET /loyalty/wallet 🔒 CUSTOMER
Returns wallet with points, tier, lifetime points, badges.

**Response:**
```json
{
  "id": "uuid",
  "points": 1500,
  "lifetimePoints": 3200,
  "tier": "SILVER",
  "badges": [{ "name": "Silver Member", "icon": "🥈" }]
}
```

---

### GET /loyalty/transactions?page=1&limit=10 🔒 CUSTOMER
Paginated transaction history.

---

### POST /loyalty/redeem 🔒 CUSTOMER
```json
{ "rewardId": "reward-uuid" }
```

**Response:** Coupon with code + QR data.

---

### POST /loyalty/earn 🔒 MERCHANT
```json
{
  "customerId": "user-uuid",
  "purchaseAmount": 500,
  "description": "Dine-in purchase"
}
```

**Response:**
```json
{
  "pointsEarned": 500,
  "newBalance": 2000,
  "transaction": { ... }
}
```

---

### GET /loyalty/tiers
Returns tier configuration (no auth required).

---

## 🎁 Rewards Endpoints

### GET /rewards?merchantId=uuid
List all active rewards (optional filter by merchant).

### GET /rewards/:id
Get single reward.

### POST /rewards 🔒 MERCHANT
```json
{
  "name": "Free Coffee",
  "description": "One free coffee of your choice",
  "requiredPoints": 500,
  "stock": 100,
  "expiryDate": "2025-12-31"
}
```

### PUT /rewards/:id 🔒 MERCHANT
Update reward fields.

### DELETE /rewards/:id 🔒 MERCHANT

---

## 📢 Promotions Endpoints

### GET /promotions
All active promotions.

### GET /promotions/my 🔒 CUSTOMER
Personalized offers.

### GET /promotions/merchant 🔒 MERCHANT
Merchant's own promotions.

### POST /promotions 🔒 MERCHANT
```json
{
  "title": "Weekend Special",
  "description": "Double points on weekends!",
  "discount": 20,
  "bonusPoints": 100,
  "minPurchase": 200,
  "expiryDate": "2025-06-30"
}
```

### PUT /promotions/:id 🔒 MERCHANT
### DELETE /promotions/:id 🔒 MERCHANT

---

## 🎫 Coupons Endpoints

### GET /coupons/my 🔒 CUSTOMER
Customer's own coupons.

### POST /coupons/generate 🔒 MERCHANT
```json
{
  "customerId": "user-uuid",
  "rewardId": "reward-uuid",
  "expiryDate": "2025-12-31"
}
```

### POST /coupons/verify 🔒 MERCHANT
```json
{ "code": "LH-1234567890-ABCDE" }
```

**Response:**
```json
{
  "valid": true,
  "coupon": {
    "code": "LH-...",
    "status": "ACTIVE",
    "reward": { "name": "Free Coffee" },
    "customer": { "name": "John Doe" }
  }
}
```

### POST /coupons/:code/redeem 🔒 MERCHANT
Mark coupon as redeemed.

### GET /coupons/:code/qr 🔒 CUSTOMER
Returns QR code as base64 data URL.

---

## 📊 Analytics Endpoints

### GET /analytics/merchant/dashboard 🔒 MERCHANT
Returns stats: totalCustomers, totalTransactions, totalRevenue, points issued, active rewards/coupons, recent transactions.

### GET /analytics/merchant/sales?period=30 🔒 MERCHANT
Sales report grouped by day.

### GET /analytics/admin/platform 🔒 SUPER_ADMIN
Platform-wide totals.

### GET /analytics/admin/merchants 🔒 SUPER_ADMIN
All merchants with transaction counts.

---

## 🏪 Merchants Endpoints

### GET /merchants/profile 🔒 MERCHANT
Own merchant profile.

### PUT /merchants/profile 🔒 MERCHANT
Update store info and pointsPerRupee rate.

### GET /merchants/customers?page=1&search= 🔒 MERCHANT
Paginated customer list.

### GET /merchants/loyalty-rules 🔒 MERCHANT

### GET /merchants?page=1 🔒 SUPER_ADMIN
All merchants.

### PUT /merchants/:id/status 🔒 SUPER_ADMIN
Toggle merchant active status.

---

## 👥 Users Endpoints

### GET /users/profile 🔒 AUTH
Own profile.

### PUT /users/profile 🔒 AUTH
Update name, phone, avatar.

### GET /users/referral 🔒 CUSTOMER
Referral link, code, and referred friends list.

### GET /users?page=1 🔒 SUPER_ADMIN
All users.

### PUT /users/:id/status 🔒 SUPER_ADMIN
Toggle user active status.

---

## Error Responses

All errors follow:
```json
{
  "statusCode": 400,
  "message": "Description of the error",
  "error": "Bad Request"
}
```

| Code | Meaning |
|---|---|
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized — invalid or missing JWT |
| 403 | Forbidden — insufficient role |
| 404 | Not Found |
| 409 | Conflict (e.g. email already exists) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |
