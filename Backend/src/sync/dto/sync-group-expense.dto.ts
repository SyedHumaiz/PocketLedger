import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsObject, IsOptional, IsUUID, Min } from 'class-validator';
import { ExpenseSyncOperationType } from './sync-expense.dto';
export class SyncGroupExpenseDto { @IsUUID('4') operationId!:string; @IsEnum(ExpenseSyncOperationType) operationType!:ExpenseSyncOperationType; @IsUUID('4') groupId!:string; @IsUUID('4') entityId!:string; @IsObject() payload!:Record<string,unknown>; @IsOptional() @Type(()=>Number) @IsInt() @Min(1) baseVersion?:number; }
