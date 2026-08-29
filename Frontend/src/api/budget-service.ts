import { api } from './client';
export { mapBudgetResponse, type BudgetResponse } from './budget-mapping';
import type { BudgetResponse } from './budget-mapping';
export interface BudgetInput {amountMinor:number;month:number;year:number;categoryId?:string|null;}
export const getBudgets=async(query?:{month?:number;year?:number}):Promise<BudgetResponse[]>=>(await api.get<BudgetResponse[]>('/budgets',{params:query})).data;
export const getBudget=async(id:string):Promise<BudgetResponse>=>(await api.get<BudgetResponse>(`/budgets/${id}`)).data;
export const createBudget=async(input:BudgetInput):Promise<BudgetResponse>=>(await api.post<BudgetResponse>('/budgets',input)).data;
export const updateBudget=async(id:string,input:BudgetInput):Promise<BudgetResponse>=>(await api.patch<BudgetResponse>(`/budgets/${id}`,input)).data;
export const deleteBudget=async(id:string):Promise<void>=>{await api.delete(`/budgets/${id}`);};
