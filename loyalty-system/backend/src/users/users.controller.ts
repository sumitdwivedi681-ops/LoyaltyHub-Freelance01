import { Controller, Get, Put, Body, UseGuards, Request, Query, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Get('referral')
  @Roles('CUSTOMER')
  getReferral(@Request() req: any) {
    return this.usersService.getReferralInfo(req.user.id);
  }

  // Admin routes
  @Get()
  @Roles('SUPER_ADMIN')
  getAllUsers(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.usersService.findAll(+page, +limit);
  }

  @Put(':id/status')
  @Roles('SUPER_ADMIN')
  toggleUserStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.usersService.toggleStatus(id, isActive);
  }
}
