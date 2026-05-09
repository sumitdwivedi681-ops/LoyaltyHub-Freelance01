import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GenerateCouponDto } from './dto/generate-coupon.dto';
import { VerifyCouponDto } from './dto/verify-coupon.dto';

@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('my')
  @Roles('CUSTOMER')
  getMyCoupons(@Request() req: any) {
    return this.couponsService.getMyCoupons(req.user.id);
  }

  @Post('generate')
  @Roles('MERCHANT', 'SUPER_ADMIN')
  generate(@Request() req: any, @Body() dto: GenerateCouponDto) {
    return this.couponsService.generate(req.user.id, dto);
  }

  @Post('verify')
  @Roles('MERCHANT')
  verify(@Body() dto: VerifyCouponDto) {
    return this.couponsService.verify(dto.code);
  }

  @Post(':code/redeem')
  @Roles('MERCHANT')
  redeem(@Param('code') code: string, @Request() req: any) {
    return this.couponsService.redeem(code, req.user.id);
  }

  @Get(':code/qr')
  @Roles('CUSTOMER')
  getQR(@Param('code') code: string) {
    return this.couponsService.getQRCode(code);
  }
}
