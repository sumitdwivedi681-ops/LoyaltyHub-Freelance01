import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MerchantsModule } from './merchants/merchants.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { RewardsModule } from './rewards/rewards.module';
import { PromotionsModule } from './promotions/promotions.module';
import { CouponsModule } from './coupons/coupons.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting: 100 requests per 60 seconds
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    MerchantsModule,
    LoyaltyModule,
    RewardsModule,
    PromotionsModule,
    CouponsModule,
    AnalyticsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
