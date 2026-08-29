import type { LocalExpenseRecord, SyncQueueRecord } from '../../db/types';
import { formatAmount } from '../expenses/expense-presenter';

export const monthKey=(date=new Date()):string=>date.toISOString().slice(0,7);
export function currentMonthExpenses(expenses:readonly LocalExpenseRecord[], now=new Date()):LocalExpenseRecord[]{const key=monthKey(now);return expenses.filter(item=>item.expenseDate.slice(0,7)===key);}
export function monthlySpendingTotal(expenses:readonly LocalExpenseRecord[], now=new Date()):number{return currentMonthExpenses(expenses,now).reduce((sum,item)=>sum+item.amountMinor,0);}
export function selectRecentExpenses(expenses:readonly LocalExpenseRecord[],limit=5):LocalExpenseRecord[]{return [...expenses].sort((a,b)=>`${b.expenseDate}${b.createdAt}`.localeCompare(`${a.expenseDate}${a.createdAt}`)).slice(0,limit);}
export function pendingSyncCount(items:readonly SyncQueueRecord[]):number{return items.filter(item=>item.status==='PENDING'||item.status==='PROCESSING'||item.status==='FAILED').length;}
export function dashboardViewModel(expenses:readonly LocalExpenseRecord[],queue:readonly SyncQueueRecord[],now=new Date()){const month=currentMonthExpenses(expenses,now);const currency=month[0]?.currency??'USD';return {monthTotal:formatAmount(monthlySpendingTotal(expenses,now),currency),monthExpenseCount:month.length,pendingCount:pendingSyncCount(queue),recent:selectRecentExpenses(expenses)};}
