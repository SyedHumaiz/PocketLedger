import assert from 'node:assert/strict';
import test from 'node:test';
import { amountToMinor, formatExpenseDate, syncDisplayState, toExpenseViewModel } from './expense-presenter';
import type { LocalCategoryRecord, LocalExpenseRecord } from '../../db/types';
test('converts major currency values safely to minor units',()=>{assert.equal(amountToMinor('12.34'),1234);assert.equal(amountToMinor('7'),700);});
test('rejects invalid amounts',()=>{for(const amount of ['0','-1','1.234','abc',''])assert.throws(()=>amountToMinor(amount));});
test('formats an expense date',()=>assert.equal(formatExpenseDate('2026-01-05'),'Jan 5, 2026'));
test('maps an expense and category to a display model',()=>{const expense:LocalExpenseRecord={id:'expense',userId:'user',categoryId:'category',amountMinor:1234,currency:'USD',description:'Lunch',expenseDate:'2026-01-05',createdAt:'',updatedAt:'',version:1,deletedAt:null,syncStatus:'PENDING'};const category:LocalCategoryRecord={id:'category',userId:'user',name:'Food',normalizedName:'food',createdAt:'',updatedAt:'',deletedAt:null,syncStatus:'SYNCED'};assert.deepEqual(toExpenseViewModel(expense,[category]),{id:'expense',description:'Lunch',amount:'USD 12.34',date:'Jan 5, 2026',categoryName:'Food',syncLabel:'Pending sync'});});
test('shows pending, synced, and conflict display states',()=>{assert.equal(syncDisplayState('PENDING'),'Pending sync');assert.equal(syncDisplayState('SYNCED'),'Synced');assert.equal(syncDisplayState('SYNCED',true),'Conflict');});
