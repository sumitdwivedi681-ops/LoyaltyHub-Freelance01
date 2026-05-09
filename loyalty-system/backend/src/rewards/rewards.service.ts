import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRewardDto } from './dto/create-reward.dto';

@Injectable()
export class RewardsService {
  constructor(private prisma: PrismaService) {}

  async findAll(merchantId?: string) {
    const where: any = { isActive: true };
    if (merchantId) where.merchantId = merchantId;
    return this.prisma.reward.findMany({
      where,
      include: { merchant: { select: { storeName: true, logo: true } } },
      orderBy: { requiredPoints: 'asc' },
    });
  }

  async findOne(id: string) {
    const reward = await this.prisma.reward.findUnique({
      where: { id },
      include: { merchant: { select: { storeName: true, logo: true } } },
    });
    if (!reward) throw new NotFoundException('Reward not found');
    return reward;
  }

  async create(userId: string, dto: CreateRewardDto) {
    const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: userId } });
    if (!merchant) throw new NotFoundException('Merchant not found');
    return this.prisma.reward.create({
      data: { ...dto, merchantId: merchant.id },
    });
  }

  async update(id: string, userId: string, dto: Partial<CreateRewardDto>) {
    const reward = await this.prisma.reward.findUnique({
      where: { id },
      include: { merchant: true },
    });
    if (!reward) throw new NotFoundException('Reward not found');
    if (reward.merchant.ownerId !== userId) throw new ForbiddenException();
    return this.prisma.reward.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const reward = await this.prisma.reward.findUnique({
      where: { id },
      include: { merchant: true },
    });
    if (!reward) throw new NotFoundException('Reward not found');
    if (reward.merchant.ownerId !== userId) throw new ForbiddenException();
    await this.prisma.reward.delete({ where: { id } });
    return { message: 'Reward deleted' };
  }
}
