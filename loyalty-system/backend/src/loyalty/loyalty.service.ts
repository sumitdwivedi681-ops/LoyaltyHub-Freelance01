import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EarnPointsDto } from './dto/earn-points.dto';

// Tier thresholds (lifetime points)
const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 1000,
  GOLD: 5000,
  PLATINUM: 15000,
};

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  async getWallet(userId: string) {
    const wallet = await this.prisma.loyaltyPoints.findUnique({
      where: { userId },
      include: {
        user: {
          select: { name: true, email: true, referralCode: true },
        },
      },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const badges = await this.prisma.badge.findMany({ where: { userId } });
    return { ...wallet, badges };
  }

  async getTransactions(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { customerId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { merchant: { select: { storeName: true, logo: true } } },
      }),
      this.prisma.transaction.count({ where: { customerId: userId } }),
    ]);
    return { transactions, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async redeemReward(userId: string, rewardId: string) {
    const reward = await this.prisma.reward.findUnique({ where: { id: rewardId } });
    if (!reward || !reward.isActive) throw new NotFoundException('Reward not found or inactive');

    if (reward.expiryDate && reward.expiryDate < new Date()) {
      throw new BadRequestException('Reward has expired');
    }

    const wallet = await this.prisma.loyaltyPoints.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    if (wallet.points < reward.requiredPoints) {
      throw new BadRequestException(
        `Insufficient points. Need ${reward.requiredPoints}, have ${wallet.points}`,
      );
    }

    // Use transaction for atomicity
    const [coupon] = await this.prisma.$transaction([
      this.prisma.coupon.create({
        data: {
          code: `LH-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          customerId: userId,
          merchantId: reward.merchantId,
          rewardId: reward.id,
          expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000), // 30 days
        },
      }),
      this.prisma.loyaltyPoints.update({
        where: { userId },
        data: { points: { decrement: reward.requiredPoints } },
      }),
      this.prisma.transaction.create({
        data: {
          customerId: userId,
          merchantId: reward.merchantId,
          rewardId: reward.id,
          pointsRedeemed: reward.requiredPoints,
          type: 'REDEEM',
          description: `Redeemed: ${reward.name}`,
        },
      }),
    ]);

    return { message: 'Reward redeemed successfully', coupon };
  }

  async earnPoints(merchantUserId: string, dto: EarnPointsDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: merchantUserId },
    });
    if (!merchant) throw new NotFoundException('Merchant not found');

    const customer = await this.prisma.user.findUnique({
      where: { id: dto.customerId },
      include: { loyaltyPoints: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    // Calculate points
    const pointsEarned = Math.floor(dto.purchaseAmount * merchant.pointsPerRupee);

    // Update wallet and create transaction atomically
    const [updatedWallet, transaction] = await this.prisma.$transaction([
      this.prisma.loyaltyPoints.update({
        where: { userId: dto.customerId },
        data: {
          points: { increment: pointsEarned },
          lifetimePoints: { increment: pointsEarned },
        },
      }),
      this.prisma.transaction.create({
        data: {
          customerId: dto.customerId,
          merchantId: merchant.id,
          purchaseAmount: dto.purchaseAmount,
          pointsEarned,
          type: 'EARN',
          description: dto.description || `Purchase at ${merchant.storeName}`,
        },
      }),
    ]);

    // Update tier based on lifetime points
    await this.updateTier(dto.customerId, updatedWallet.lifetimePoints);

    return { transaction, newBalance: updatedWallet.points, pointsEarned };
  }

  async updateTier(userId: string, lifetimePoints: number) {
    let tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' = 'BRONZE';
    if (lifetimePoints >= TIER_THRESHOLDS.PLATINUM) tier = 'PLATINUM';
    else if (lifetimePoints >= TIER_THRESHOLDS.GOLD) tier = 'GOLD';
    else if (lifetimePoints >= TIER_THRESHOLDS.SILVER) tier = 'SILVER';

    await this.prisma.loyaltyPoints.update({
      where: { userId },
      data: { tier },
    });

    // Award badge on tier upgrade
    const badgeName = `${tier} Member`;
    const existing = await this.prisma.badge.findFirst({
      where: { userId, name: badgeName },
    });
    if (!existing) {
      const icons: Record<string, string> = {
        BRONZE: '🥉',
        SILVER: '🥈',
        GOLD: '🥇',
        PLATINUM: '💎',
      };
      await this.prisma.badge.create({
        data: { userId, name: badgeName, icon: icons[tier], description: `Achieved ${tier} tier` },
      });
    }
  }

  getTierInfo() {
    return {
      tiers: [
        { name: 'BRONZE', minPoints: 0, maxPoints: 999, color: '#CD7F32', perks: ['1x points'] },
        { name: 'SILVER', minPoints: 1000, maxPoints: 4999, color: '#C0C0C0', perks: ['1.25x points', 'Early access to offers'] },
        { name: 'GOLD', minPoints: 5000, maxPoints: 14999, color: '#FFD700', perks: ['1.5x points', 'Priority support', 'Exclusive rewards'] },
        { name: 'PLATINUM', minPoints: 15000, maxPoints: null, color: '#E5E4E2', perks: ['2x points', 'Dedicated support', 'VIP rewards', 'Free shipping'] },
      ],
    };
  }
}
