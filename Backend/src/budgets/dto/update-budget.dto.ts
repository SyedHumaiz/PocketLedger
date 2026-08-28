import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class UpdateBudgetDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(2_147_483_647)
  amountMinor?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(12)
  month?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(2000) @Max(2999)
  year?: number;

  @IsOptional()
  @IsUUID('4')
  categoryId?: string | null;
}
