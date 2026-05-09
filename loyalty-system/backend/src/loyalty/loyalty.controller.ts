import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RedeemRewardDto } from './dto/redeem-reward.dto';
import { EarnPointsDto } from './dto/earn-points.dto';

@Controller('loyalty')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('wallet')
  @Roles('CUSTOMER')
  getWallet(@Request() req: any) {
    return this.loyaltyService.getWallet(req.user.id);
  }

  @Get('transactions')
  @Roles('CUSTOMER')
  getTransactions(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.loyaltyService.getTransactions(req.user.id, +page, +limit);
  }

  @Post('redeem')
  @Roles('CUSTOMER')
  redeemReward(@Request() req: any, @Body() dto: RedeemRewardDto) {
    return this.loyaltyService.redeemReward(req.user.id, dto.rewardId);
  }

  @Post('earn')
  @Roles('MERCHANT')
  earnPoints(@Request() req: any, @Body() dto: EarnPointsDto) {
    return this.loyaltyService.earnPoints(req.user.id, dto);
  }

  @Get('tiers')
  getTiers() {
    return this.loyaltyService.getTierInfo();
  }
}
