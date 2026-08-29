import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { IsIsoCalendarDate } from '../../expenses/dto/is-iso-calendar-date';

export class ExpenseShareDto {
  @IsUUID('4') userId!: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(2_147_483_647) amountMinor!: number;
}
export class CreateGroupExpenseDto {
  @Type(() => Number) @IsInt() @Min(1) @Max(2_147_483_647) amountMinor!: number;
  @IsString() @Matches(/^[A-Z]{3}$/) currency!: string;
  @IsString() @IsNotEmpty() @MaxLength(1_000) description!: string;
  @IsIsoCalendarDate() expenseDate!: string;
  @IsUUID('4') categoryId!: string;
  @IsUUID('4') paidByUserId!: string;
  @IsArray() @ArrayNotEmpty() @ValidateNested({each:true}) @Type(()=>ExpenseShareDto) shares!: ExpenseShareDto[];
}
export class UpdateGroupExpenseDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(2_147_483_647) amountMinor?: number;
  @IsOptional() @IsString() @Matches(/^[A-Z]{3}$/) currency?: string;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(1_000) description?: string;
  @IsOptional() @IsIsoCalendarDate() expenseDate?: string;
  @IsOptional() @IsUUID('4') categoryId?: string;
  @IsOptional() @IsUUID('4') paidByUserId?: string;
  @IsArray() @ArrayNotEmpty() @ValidateNested({each:true}) @Type(()=>ExpenseShareDto) shares!: ExpenseShareDto[];
}
