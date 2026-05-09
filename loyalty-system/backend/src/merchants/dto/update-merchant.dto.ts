import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class UpdateMerchantDto {
  @IsOptional() @IsString() storeName?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() logo?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) pointsPerRupee?: number;
}
