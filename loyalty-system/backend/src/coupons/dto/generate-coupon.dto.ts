import { IsDateString, IsOptional, IsString } from 'class-validator';
export class GenerateCouponDto {
  @IsString() customerId: string;
  @IsString() rewardId: string;
  @IsOptional() @IsDateString() expiryDate?: string;
}
