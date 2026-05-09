# ER Diagram — LoyaltyHub Database

## Entity Relationship Diagram

```mermaid
erDiagram
    User {
        string id PK
        string name
        string email UK
        string password
        Role role
        string phone
        string avatar
        boolean isActive
        string googleId
        string referralCode UK
        datetime createdAt
        datetime updatedAt
    }

    Merchant {
        string id PK
        string storeName
        string description
        string address
        string city
        string logo
        string website
        boolean isActive
        float pointsPerRupee
        string ownerId FK
        datetime createdAt
        datetime updatedAt
    }

    LoyaltyPoints {
        string id PK
        int points
        int lifetimePoints
        Tier tier
        string userId FK
        datetime updatedAt
    }

    Transaction {
        string id PK
        float purchaseAmount
        int pointsEarned
        int pointsRedeemed
        TransactionType type
        string description
        string reference
        string customerId FK
        string merchantId FK
        string rewardId FK
        datetime createdAt
    }

    Reward {
        string id PK
        string name
        string description
        int requiredPoints
        int stock
        string imageUrl
        boolean isActive
        datetime expiryDate
        string merchantId FK
        datetime createdAt
        datetime updatedAt
    }

    Promotion {
        string id PK
        string title
        string description
        float discount
        int bonusPoints
        float minPurchase
        string imageUrl
        boolean isActive
        datetime expiryDate
        string merchantId FK
        datetime createdAt
        datetime updatedAt
    }

    Coupon {
        string id PK
        string code UK
        CouponStatus status
        datetime redeemedAt
        datetime expiryDate
        string customerId FK
        string merchantId FK
        string rewardId FK
        datetime createdAt
    }

    Badge {
        string id PK
        string name
        string description
        string icon
        string userId FK
        datetime earnedAt
    }

    Referral {
        string id PK
        int pointsAwarded
        string referrerId FK
        string refereeId FK
        datetime createdAt
    }

    LoyaltyRule {
        string id PK
        string name
        float pointsPerRupee
        float minPurchase
        float bonusMultiplier
        boolean isActive
        string merchantId FK
        datetime createdAt
        datetime updatedAt
    }

    PasswordReset {
        string id PK
        string token UK
        datetime expiresAt
        boolean used
        string userId FK
        datetime createdAt
    }

    User ||--o| Merchant : "owns"
    User ||--o| LoyaltyPoints : "has"
    User ||--o{ Transaction : "makes"
    User ||--o{ Coupon : "holds"
    User ||--o{ Badge : "earns"
    User ||--o{ Referral : "refers"
    User ||--o{ PasswordReset : "requests"

    Merchant ||--o{ Transaction : "receives"
    Merchant ||--o{ Reward : "offers"
    Merchant ||--o{ Promotion : "creates"
    Merchant ||--o{ Coupon : "issues"
    Merchant ||--o{ LoyaltyRule : "defines"

    Reward ||--o{ Coupon : "generates"
    Reward ||--o{ Transaction : "used in"
```

---

## Enums

### Role
- `CUSTOMER` — Regular user
- `MERCHANT` — Store owner
- `SUPER_ADMIN` — Platform administrator

### Tier
- `BRONZE` — 0–999 lifetime points
- `SILVER` — 1,000–4,999 lifetime points
- `GOLD` — 5,000–14,999 lifetime points
- `PLATINUM` — 15,000+ lifetime points

### TransactionType
- `EARN` — Points earned from purchase
- `REDEEM` — Points spent on reward
- `REFERRAL_BONUS` — Bonus from referral
- `ADMIN_ADJUSTMENT` — Manual admin change
- `EXPIRY` — Points expired

### CouponStatus
- `ACTIVE` — Valid, not yet used
- `REDEEMED` — Used by merchant
- `EXPIRED` — Past expiry date

---

## Key Relationships

| Relationship | Cardinality | Notes |
|---|---|---|
| User → LoyaltyPoints | 1:1 | Each customer has exactly one wallet |
| User → Merchant | 1:1 | Each merchant account belongs to one user |
| User → Transaction | 1:N | Customer can have many transactions |
| Merchant → Reward | 1:N | Merchant manages their reward catalog |
| Merchant → Promotion | 1:N | Merchant runs multiple campaigns |
| Reward → Coupon | 1:N | Each coupon is generated from a reward |
| User → Referral | 1:N | User can refer multiple friends |
