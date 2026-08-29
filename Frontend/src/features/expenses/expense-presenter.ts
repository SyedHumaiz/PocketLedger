import type { LocalCategoryRecord, LocalExpenseRecord, SyncStatus } from '../../db/types';
import { formatMinor, majorToMinor } from '../currency/amount';
export interface ExpenseViewModel { id:string; description:string; amount:string; date:string; categoryName:string; syncLabel:string; }
export const amountToMinor=majorToMinor;
export const formatAmount=(amountMinor:number,currency:string,showDecimalPlaces=true):string=>formatMinor(amountMinor,currency,showDecimalPlaces);
export function formatExpenseDate(value:string):string{const date=new Date(`${value.slice(0,10)}T00:00:00.000Z`);if(Number.isNaN(date.getTime()))return value;return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(date);}
export function syncDisplayState(status:SyncStatus,hasConflict=false,isSyncing=false):string{if(hasConflict)return 'Conflict';if(status==='PENDING')return isSyncing?'Syncing':'Pending sync';if(status==='FAILED')return 'Sync failed';return 'Synced';}
export function toExpenseViewModel(expense:LocalExpenseRecord,categories:readonly LocalCategoryRecord[],isSyncing=false,hasConflict=false):ExpenseViewModel{return {id:expense.id,description:expense.description,amount:formatAmount(expense.amountMinor,expense.currency),date:formatExpenseDate(expense.expenseDate),categoryName:categories.find(category=>category.id===expense.categoryId)?.name??'Uncategorized',syncLabel:syncDisplayState(expense.syncStatus,hasConflict,isSyncing)};}
export function isValidExpenseDate(value:string):boolean{return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());}
