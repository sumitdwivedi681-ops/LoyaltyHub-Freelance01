import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

@Injectable()
export class MerchantsService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: userId },
      include: {
        _count: { select: { transactions: true, rewards: true, promotions: true } },
      },
    });
    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }

  async updateProfile(userId: string, dto: UpdateMerchantDto) {
    const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: userId } });
    if (!merchant) throw new NotFoundException('Merchant not found');
    return this.prisma.merchant.update({ where: { id: merchant.id }, data: dto });
  }

  async getCustomers(userId: string, page: number, search?: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: userId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    const limit = 20;
    const skip = (page - 1) * limit;

    // Get unique customers who transacted with this merchant
    const customerIds = await this.prisma.transaction.groupBy({
      by: ['customerId'],
      where: { merchantId: merchant.id },
    }).then(r => r.map(x => x.customerId));

    const where: any = { id: { in: customerIds } };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          loyaltyPoints: { select: { points: true, tier: true } },
        },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { customers, total, page, limit };
  }

  async getLoyaltyRules(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: userId } });
    if (!merchant) throw new NotFoundException('Merchant not found');
    return this.prisma.loyaltyRule.findMany({ where: { merchantId: merchant.id } });
  }

  async findAll(page: number) {
    const limit = 20;
    const skip = (page - 1) * limit;
    const [merchants, total] = await Promise.all([
      this.prisma.merchant.findMany({
        skip,
        take: limit,
        include: {
          owner: { select: { name: true, email: true } },
          _count: { select: { transactions: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.merchant.count(),
    ]);
    return { merchants, total, page, limit };
  }

  async toggleStatus(id: string, isActive: boolean) {
    return this.prisma.merchant.update({ where: { id }, data: { isActive } });
  }
}
