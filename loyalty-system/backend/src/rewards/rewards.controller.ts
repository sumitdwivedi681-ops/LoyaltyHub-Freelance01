import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateRewardDto } from './dto/create-reward.dto';

@Controller('rewards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  getAllRewards(@Query('merchantId') merchantId?: string) {
    return this.rewardsService.findAll(merchantId);
  }

  @Get(':id')
  getReward(@Param('id') id: string) {
    return this.rewardsService.findOne(id);
  }

  @Post()
  @Roles('MERCHANT', 'SUPER_ADMIN')
  createReward(@Request() req: any, @Body() dto: CreateRewardDto) {
    return this.rewardsService.create(req.user.id, dto);
  }

  @Put(':id')
  @Roles('MERCHANT', 'SUPER_ADMIN')
  updateReward(@Param('id') id: string, @Request() req: any, @Body() dto: Partial<CreateRewardDto>) {
    return this.rewardsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @Roles('MERCHANT', 'SUPER_ADMIN')
  deleteReward(@Param('id') id: string, @Request() req: any) {
    return this.rewardsService.remove(id, req.user.id);
  }
}
