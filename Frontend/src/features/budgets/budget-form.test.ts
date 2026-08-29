import test from 'node:test';
import assert from 'node:assert/strict';
import { mapBudgetResponse } from '../../api/budget-mapping';
import { budgetMutationError } from './budget-errors';
import { validateBudgetForm } from './budget-form';
test('validates budget input and requires a category only for category budgets',()=>{assert.equal(validateBudgetForm({amountMinor:'5000',month:'8',year:'2026',type:'overall',categoryId:'ignored'}).value?.categoryId,null);assert.equal(validateBudgetForm({amountMinor:'5000',month:'8',year:'2026',type:'category',categoryId:null}).error,'Select a category for this budget.');assert.equal(validateBudgetForm({amountMinor:'1.2',month:'13',year:'1999',type:'overall',categoryId:null}).error,'Enter a positive whole amount in minor units.');});
test('maps an API budget to the synced local cache',()=>assert.deepEqual(mapBudgetResponse({id:'b',amountMinor:5000,month:8,year:2026,categoryId:null,createdAt:'a',updatedAt:'b'},'u'),{id:'b',userId:'u',amountMinor:5000,month:8,year:2026,categoryId:null,createdAt:'a',updatedAt:'b',deletedAt:null,syncStatus:'SYNCED'}));
test('maps budget conflicts for display',()=>assert.equal(budgetMutationError({status:409,message:'A budget already exists for this period and category.'}),'A budget already exists for this period and category.'));
