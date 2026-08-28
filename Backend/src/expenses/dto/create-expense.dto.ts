import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
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

export class CreateExpenseDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2_147_483_647)
  amountMinor!: number;

  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'currency must be a three-letter uppercase code',
  })
  currency!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(1_000)
  description!: string;

  @IsIsoCalendarDate({
    message: 'expenseDate must be a valid ISO date in YYYY-MM-DD format',
  })
  expenseDate!: string;

  @IsUUID('4')
  categoryId!: string;
}
