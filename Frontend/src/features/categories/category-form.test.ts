import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCategoryName } from './category-form';
import { categoryMutationError } from './category-errors';
test('validates and trims category names',()=>{assert.deepEqual(validateCategoryName('  Food  '),{value:'Food',error:null});assert.equal(validateCategoryName('   ').error,'Enter a category name.');});
test('maps category mutation conflict errors',()=>assert.equal(categoryMutationError({status:409,message:'A category with this name already exists.'}),'A category with this name already exists.'));
