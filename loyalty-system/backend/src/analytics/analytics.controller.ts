import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('merchant/dashboard')
  @Roles('MERCHANT')
  getMerchantDashboard(@Request() req: any) {
    return this.analyticsService.getMerchantDashboard(req.user.id);
  }

  @Get('merchant/sales')
  @Roles('MERCHANT')
  getSalesReport(@Request() req: any, @Query('period') period = '30') {
    return this.analyticsService.getSalesReport(req.user.id, +period);
  }

  @Get('admin/platform')
  @Roles('SUPER_ADMIN')
  getPlatformStats() {
    return this.analyticsService.getPlatformStats();
  }

  @Get('admin/merchants')
  @Roles('SUPER_ADMIN')
  getMerchantsStats() {
    return this.analyticsService.getMerchantsStats();
  }
}
