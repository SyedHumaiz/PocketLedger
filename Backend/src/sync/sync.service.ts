import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ExpenseSyncOperationType, SyncExpenseDto } from './dto/sync-expense.dto';

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaService) {}
  async syncExpense(userId:string,dto:SyncExpenseDto):Promise<unknown>{
    if (dto.operationType !== ExpenseSyncOperationType.CREATE && dto.baseVersion === undefined) throw new ConflictException('baseVersion is required for updates and deletes.');
    const hash=this.hash(dto); const existing=await this.prisma.processedOperation.findUnique({where:{userId_operationId:{userId,operationId:dto.operationId}}});
    if(existing){if(existing.requestHash!==hash)throw new ConflictException('operationId was already used with a different request.');return JSON.parse(existing.resultJson);}
    try{return await this.prisma.$transaction(async tx=>{const result=await this.apply(tx,userId,dto);await tx.processedOperation.create({data:{operationId:dto.operationId,userId,entityType:'expense',entityId:dto.entityId,operationType:dto.operationType,requestHash:hash,resultJson:JSON.stringify(result)}});return result;});}
    catch(error:unknown){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002'){const replay=await this.prisma.processedOperation.findUnique({where:{userId_operationId:{userId,operationId:dto.operationId}}});if(replay&&replay.requestHash===hash)return JSON.parse(replay.resultJson);throw new ConflictException('operationId was already used with a different request.');}throw error;}
  }
  private async apply(tx:Prisma.TransactionClient,userId:string,dto:SyncExpenseDto):Promise<unknown>{
    if(dto.operationType===ExpenseSyncOperationType.CREATE){const p=dto.payload as any;if(!p.categoryId||!await tx.category.findFirst({where:{id:p.categoryId,userId}}))throw new NotFoundException('Category not found.');if(await tx.expense.findUnique({where:{id:dto.entityId}}))throw new ConflictException('Expense already exists.');const expense=await tx.expense.create({data:{id:dto.entityId,userId,paidByUserId:userId,categoryId:p.categoryId,amountMinor:p.amountMinor,currency:p.currency,description:p.description,expenseDate:new Date(`${p.expenseDate}T00:00:00.000Z`),version:1}});return {status:'APPLIED',expense};}
    const current=await tx.expense.findFirst({where:{id:dto.entityId,userId}});if(!current)throw new NotFoundException('Expense not found.');if(current.version!==dto.baseVersion)return {status:'CONFLICT',expense:current};
    if(dto.operationType===ExpenseSyncOperationType.DELETE){const expense=await tx.expense.update({where:{id:current.id},data:{deletedAt:new Date(),version:{increment:1}}});return {status:'APPLIED',expense};}
    const p=dto.payload as any;if(p.categoryId&&p.categoryId!==current.categoryId&&!await tx.category.findFirst({where:{id:p.categoryId,userId}}))throw new NotFoundException('Category not found.');const expense=await tx.expense.update({where:{id:current.id},data:{...(p.amountMinor!==undefined&&{amountMinor:p.amountMinor}),...(p.currency!==undefined&&{currency:p.currency}),...(p.description!==undefined&&{description:p.description}),...(p.expenseDate!==undefined&&{expenseDate:new Date(`${p.expenseDate}T00:00:00.000Z`)}),...(p.categoryId!==undefined&&{categoryId:p.categoryId}),version:{increment:1}}});return {status:'APPLIED',expense};
  }
  private hash(dto:SyncExpenseDto){return createHash('sha256').update(this.canonical(dto)).digest('hex');}
  private canonical(value:unknown):string{if(Array.isArray(value))return `[${value.map(v=>this.canonical(v)).join(',')}]`;if(value&&typeof value==='object')return `{${Object.keys(value as object).sort().map(k=>`${JSON.stringify(k)}:${this.canonical((value as Record<string,unknown>)[k])}`).join(',')}}`;return JSON.stringify(value);}
}
