import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class EarnPointsDto {
  @IsString()
  customerId: string;

  @IsNumber()
  @Min(0)
  purchaseAmount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
