import { IsString } from 'class-validator';
export class VerifyCouponDto {
  @IsString() code: string;
}
