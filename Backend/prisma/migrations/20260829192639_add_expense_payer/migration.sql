-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "paidByUserId" UUID;

-- Existing personal expenses were paid by their creator before payer tracking existed.
UPDATE "Expense" SET "paidByUserId" = "userId" WHERE "paidByUserId" IS NULL;

ALTER TABLE "Expense" ALTER COLUMN "paidByUserId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Expense_paidByUserId_idx" ON "Expense"("paidByUserId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_paidByUserId_fkey" FOREIGN KEY ("paidByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
