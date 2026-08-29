import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Prisma } from '@prisma/client';

describe('expense payer schema and migration',()=>{
  const migration=readFileSync(join(__dirname,'../../prisma/migrations/20260829192639_add_expense_payer/migration.sql'),'utf8');
  it('backfills every existing expense payer from its creator before enforcing the column',()=>{expect(migration).toContain('ADD COLUMN "paidByUserId" UUID;');expect(migration).toContain('UPDATE "Expense" SET "paidByUserId" = "userId"');expect(migration).toContain('ALTER COLUMN "paidByUserId" SET NOT NULL');});
  it('exposes an explicit required payer relation separate from the expense creator',()=>{const expense=Prisma.dmmf.datamodel.models.find(model=>model.name==='Expense');const user=Prisma.dmmf.datamodel.models.find(model=>model.name==='User');expect(expense?.fields.find(field=>field.name==='paidByUserId')?.isRequired).toBe(true);expect(expense?.fields.find(field=>field.name==='paidByUser')?.relationName).toBe('ExpensePayer');expect(user?.fields.find(field=>field.name==='paidExpenses')?.relationName).toBe('ExpensePayer');expect(migration).toContain('Expense_paidByUserId_fkey');});
});
