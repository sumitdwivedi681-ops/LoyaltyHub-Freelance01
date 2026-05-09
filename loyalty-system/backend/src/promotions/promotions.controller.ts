import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@Controller('promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  getAll() {
    return this.promotionsService.findAll();
  }

  @Get('my')
  @Roles('CUSTOMER')
  getPersonalized(@Request() req: any) {
    return this.promotionsService.getPersonalized(req.user.id);
  }

  @Get('merchant')
  @Roles('MERCHANT')
  getMerchantPromotions(@Request() req: any) {
    return this.promotionsService.findByMerchant(req.user.id);
  }

  @Post()
  @Roles('MERCHANT', 'SUPER_ADMIN')
  create(@Request() req: any, @Body() dto: CreatePromotionDto) {
    return this.promotionsService.create(req.user.id, dto);
  }

  @Put(':id')
  @Roles('MERCHANT', 'SUPER_ADMIN')
  update(@Param('id') id: string, @Request() req: any, @Body() dto: Partial<CreatePromotionDto>) {
    return this.promotionsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @Roles('MERCHANT', 'SUPER_ADMIN')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.promotionsService.remove(id, req.user.id);
  }
}
