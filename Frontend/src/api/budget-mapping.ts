import type { LocalBudgetRecord } from '../db/types';
export interface BudgetResponse {id:string;amountMinor:number;month:number;year:number;categoryId:string|null;createdAt:string;updatedAt:string;category?:{id:string;name:string}|null;}
export function mapBudgetResponse(budget:BudgetResponse,userId:string):LocalBudgetRecord{return {id:budget.id,userId,categoryId:budget.categoryId,amountMinor:budget.amountMinor,month:budget.month,year:budget.year,createdAt:budget.createdAt,updatedAt:budget.updatedAt,deletedAt:null,syncStatus:'SYNCED'};}
