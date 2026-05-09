import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateCouponDto } from './dto/generate-coupon.dto';
import * as QRCode from 'qrcode';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async getMyCoupons(userId: string) {
    return this.prisma.coupon.findMany({
      where: { customerId: userId },
      include: {
        reward: { select: { name: true, description: true } },
        merchant: { select: { storeName: true, logo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generate(userId: string, dto: GenerateCouponDto) {
    const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: userId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    const customer = await this.prisma.user.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const reward = await this.prisma.reward.findUnique({ where: { id: dto.rewardId } });
    if (!reward) throw new NotFoundException('Reward not found');

    const code = `LH-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const coupon = await this.prisma.coupon.create({
      data: {
        code,
        customerId: dto.customerId,
        merchantId: merchant.id,
        rewardId: dto.rewardId,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    });
    return coupon;
  }

  async verify(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
      include: {
        reward: true,
        customer: { select: { name: true, email: true } },
      },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    if (coupon.status === 'REDEEMED') throw new BadRequestException('Coupon already redeemed');
    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      throw new BadRequestException('Coupon has expired');
    }
    return { valid: true, coupon };
  }

  async redeem(code: string, merchantUserId: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
      include: { merchant: true },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    if (coupon.merchant.ownerId !== merchantUserId) throw new ForbiddenException('Not your coupon');
    if (coupon.status === 'REDEEMED') throw new BadRequestException('Already redeemed');

    return this.prisma.coupon.update({
      where: { code },
      data: { status: 'REDEEMED', redeemedAt: new Date() },
    });
  }

  async getQRCode(code: string) {
    const qrDataUrl = await QRCode.toDataURL(code, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 256,
    });
    return { code, qrDataUrl };
  }
}
