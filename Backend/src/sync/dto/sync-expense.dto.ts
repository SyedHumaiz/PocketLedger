import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsObject, IsOptional, IsUUID, Min } from 'class-validator';
export enum ExpenseSyncOperationType { CREATE = 'CREATE', UPDATE = 'UPDATE', DELETE = 'DELETE' }
export class SyncExpenseDto {
  @IsUUID('4') operationId!: string;
  @IsEnum(ExpenseSyncOperationType) operationType!: ExpenseSyncOperationType;
  @IsUUID('4') entityId!: string;
  @IsObject() payload!: Record<string, unknown>;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) baseVersion?: number;
}
