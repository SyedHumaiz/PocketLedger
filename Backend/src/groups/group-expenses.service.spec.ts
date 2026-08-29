import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { GroupExpensesService } from './group-expenses.service';

const groupId='11111111-1111-4111-8111-111111111111'; const creator='33333333-3333-4333-8333-333333333333'; const member='44444444-4444-4444-8444-444444444444'; const outsider='55555555-5555-4555-8555-555555555555'; const categoryId='66666666-6666-4666-8666-666666666666'; const expenseId='77777777-7777-4777-8777-777777777777';
const dto=(overrides:any={})=>({amountMinor:5000,currency:'PKR',description:'Dinner',expenseDate:'2026-08-29',categoryId,paidByUserId:member,shares:[{userId:creator,amountMinor:2500},{userId:member,amountMinor:2500}],...overrides});
describe('GroupExpensesService',()=>{
  let tx:any; let prisma:any; let service:GroupExpensesService; let order:string[];
  beforeEach(()=>{
    order=[];
    tx={
      groupMember:{findMany:jest.fn(async()=>[{userId:creator},{userId:member}]),findUnique:jest.fn(async({where}:any)=>where.groupId_userId.groupId===groupId&&[creator,member].includes(where.groupId_userId.userId)?{userId:where.groupId_userId.userId}:null)},
      category:{findFirst:jest.fn(async({where}:any)=>where.id===categoryId&&where.userId===creator?{id:categoryId}:null)},
      expense:{create:jest.fn(async({data}:any)=>{order.push('create');return data;}),findFirst:jest.fn(async({where}:any)=>where.groupId===groupId?{id:expenseId,userId:creator,groupId,paidByUserId:member,categoryId,amountMinor:5000}:null),update:jest.fn(async({data}:any)=>{order.push('update');return data;})},
      expenseShare:{deleteMany:jest.fn(async()=>{order.push('deleteShares');return {count:2};})},
    };
    prisma={$transaction:jest.fn(async(work:any)=>work(tx)),...tx}; service=new GroupExpensesService(prisma,{notifySafely:jest.fn()} as any);
  });
  it('creates a valid group expense atomically with route group, creator, payer, and shares',async()=>{const result:any=await service.create(creator,groupId,dto());expect(prisma.$transaction).toHaveBeenCalled();expect(result).toMatchObject({userId:creator,groupId,paidByUserId:member,shares:{create:expect.any(Array)}});});
  it('rejects payer/share membership, duplicates, and mismatched totals before creation',async()=>{await expect(service.create(creator,groupId,dto({paidByUserId:outsider}))).rejects.toBeInstanceOf(BadRequestException);await expect(service.create(creator,groupId,dto({shares:[{userId:outsider,amountMinor:5000}]}))).rejects.toBeInstanceOf(BadRequestException);await expect(service.create(creator,groupId,dto({shares:[{userId:creator,amountMinor:2500},{userId:creator,amountMinor:2500}]}))).rejects.toBeInstanceOf(BadRequestException);await expect(service.create(creator,groupId,dto({shares:[{userId:creator,amountMinor:100}]}))).rejects.toBeInstanceOf(BadRequestException);expect(tx.expense.create).not.toHaveBeenCalled();});
  it('rejects non-members and a foreign group',async()=>{await expect(service.findOne(outsider,groupId,expenseId)).rejects.toBeInstanceOf(NotFoundException);await expect(service.findOne(creator,'22222222-2222-4222-8222-222222222222',expenseId)).rejects.toBeInstanceOf(NotFoundException);});
  it('permits only creator updates/deletes and replaces shares atomically',async()=>{tx.expense.findFirst.mockResolvedValueOnce({id:expenseId,userId:member,groupId,paidByUserId:member,categoryId,amountMinor:5000});await expect(service.update(creator,groupId,expenseId,dto())).rejects.toBeInstanceOf(ForbiddenException);tx.expense.findFirst.mockResolvedValueOnce({id:expenseId,userId:creator,groupId,paidByUserId:member,categoryId,amountMinor:5000});await service.update(creator,groupId,expenseId,dto({amountMinor:6000,shares:[{userId:creator,amountMinor:3000},{userId:member,amountMinor:3000}]}));expect(order).toEqual(['deleteShares','update']);tx.expense.findFirst.mockResolvedValueOnce({id:expenseId,userId:creator,groupId,paidByUserId:member,categoryId,amountMinor:5000});await service.remove(creator,groupId,expenseId);expect(tx.expense.update).toHaveBeenLastCalledWith(expect.objectContaining({data:expect.objectContaining({deletedAt:expect.any(Date),version:{increment:1}})}));});
});
