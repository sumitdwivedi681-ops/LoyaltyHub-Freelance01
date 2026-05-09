import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.promotion.findMany({
      where: { isActive: true, OR: [{ expiryDate: null }, { expiryDate: { gte: new Date() } }] },
      include: { merchant: { select: { storeName: true, logo: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPersonalized(_userId: string) {
    // In a real system, this would be personalized based on purchase history
    return this.findAll();
  }

  async findByMerchant(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: userId } });
    if (!merchant) throw new NotFoundException('Merchant not found');
    return this.prisma.promotion.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreatePromotionDto) {
    const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: userId } });
    if (!merchant) throw new NotFoundException('Merchant not found');
    return this.prisma.promotion.create({ data: { ...dto, merchantId: merchant.id } });
  }

  async update(id: string, userId: string, dto: Partial<CreatePromotionDto>) {
    const promo = await this.prisma.promotion.findUnique({
      where: { id }, include: { merchant: true },
    });
    if (!promo) throw new NotFoundException('Promotion not found');
    if (promo.merchant.ownerId !== userId) throw new ForbiddenException();
    return this.prisma.promotion.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const promo = await this.prisma.promotion.findUnique({
      where: { id }, include: { merchant: true },
    });
    if (!promo) throw new NotFoundException('Promotion not found');
    if (promo.merchant.ownerId !== userId) throw new ForbiddenException();
    await this.prisma.promotion.delete({ where: { id } });
    return { message: 'Promotion deleted' };
  }
}
