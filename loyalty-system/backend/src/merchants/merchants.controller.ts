import { Controller, Get, Put, Body, UseGuards, Request, Query, Param, Delete } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

@Controller('merchants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get('profile')
  @Roles('MERCHANT')
  getProfile(@Request() req: any) {
    return this.merchantsService.getProfile(req.user.id);
  }

  @Put('profile')
  @Roles('MERCHANT')
  updateProfile(@Request() req: any, @Body() dto: UpdateMerchantDto) {
    return this.merchantsService.updateProfile(req.user.id, dto);
  }

  @Get('customers')
  @Roles('MERCHANT')
  getCustomers(@Request() req: any, @Query('page') page = '1', @Query('search') search?: string) {
    return this.merchantsService.getCustomers(req.user.id, +page, search);
  }

  @Get('loyalty-rules')
  @Roles('MERCHANT')
  getLoyaltyRules(@Request() req: any) {
    return this.merchantsService.getLoyaltyRules(req.user.id);
  }

  // Admin routes
  @Get()
  @Roles('SUPER_ADMIN')
  getAll(@Query('page') page = '1') {
    return this.merchantsService.findAll(+page);
  }

  @Put(':id/status')
  @Roles('SUPER_ADMIN')
  toggleStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.merchantsService.toggleStatus(id, isActive);
  }
}
