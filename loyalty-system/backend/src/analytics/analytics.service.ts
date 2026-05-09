import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getMerchantDashboard(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: userId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    const [
      totalCustomers,
      totalTransactions,
      totalPointsIssued,
      activeRewards,
      activePromotions,
      activeCoupons,
      recentTransactions,
    ] = await Promise.all([
      this.prisma.transaction.groupBy({
        by: ['customerId'],
        where: { merchantId: merchant.id },
        _count: true,
      }).then(r => r.length),
      this.prisma.transaction.count({ where: { merchantId: merchant.id } }),
      this.prisma.transaction.aggregate({
        where: { merchantId: merchant.id, type: 'EARN' },
        _sum: { pointsEarned: true },
      }),
      this.prisma.reward.count({ where: { merchantId: merchant.id, isActive: true } }),
      this.prisma.promotion.count({ where: { merchantId: merchant.id, isActive: true } }),
      this.prisma.coupon.count({ where: { merchantId: merchant.id, status: 'ACTIVE' } }),
      this.prisma.transaction.findMany({
        where: { merchantId: merchant.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { customer: { select: { name: true, email: true } } },
      }),
    ]);

    const totalRevenue = await this.prisma.transaction.aggregate({
      where: { merchantId: merchant.id, type: 'EARN' },
      _sum: { purchaseAmount: true },
    });

    return {
      merchant,
      stats: {
        totalCustomers,
        totalTransactions,
        totalPointsIssued: totalPointsIssued._sum.pointsEarned || 0,
        totalRevenue: totalRevenue._sum.purchaseAmount || 0,
        activeRewards,
        activePromotions,
        activeCoupons,
      },
      recentTransactions,
    };
  }

  async getSalesReport(userId: string, days: number) {
    const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: userId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await this.prisma.transaction.findMany({
      where: { merchantId: merchant.id, createdAt: { gte: startDate }, type: 'EARN' },
      select: { createdAt: true, purchaseAmount: true, pointsEarned: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const grouped: Record<string, { revenue: number; points: number; count: number }> = {};
    transactions.forEach((t) => {
      const day = t.createdAt.toISOString().split('T')[0];
      if (!grouped[day]) grouped[day] = { revenue: 0, points: 0, count: 0 };
      grouped[day].revenue += t.purchaseAmount || 0;
      grouped[day].points += t.pointsEarned || 0;
      grouped[day].count += 1;
    });

    return {
      period: `${days} days`,
      chartData: Object.entries(grouped).map(([date, data]) => ({ date, ...data })),
    };
  }

  async getPlatformStats() {
    const [totalUsers, totalMerchants, totalTransactions, totalPointsIssued] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.merchant.count(),
      this.prisma.transaction.count(),
      this.prisma.transaction.aggregate({ _sum: { pointsEarned: true } }),
    ]);
    return {
      totalUsers,
      totalMerchants,
      totalTransactions,
      totalPointsIssued: totalPointsIssued._sum.pointsEarned || 0,
    };
  }

  async getMerchantsStats() {
    return this.prisma.merchant.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { transactions: true, rewards: true, promotions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
