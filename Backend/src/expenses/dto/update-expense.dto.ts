import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { IsIsoCalendarDate } from './is-iso-calendar-date';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateExpenseDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2_147_483_647)
  amountMinor?: number;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'currency must be a three-letter uppercase code',
  })
  currency?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(1_000)
  description?: string;

  @IsOptional()
  @IsIsoCalendarDate({
    message: 'expenseDate must be a valid ISO date in YYYY-MM-DD format',
  })
  expenseDate?: string;

  @IsOptional()
  @IsUUID('4')
  categoryId?: string;
}
