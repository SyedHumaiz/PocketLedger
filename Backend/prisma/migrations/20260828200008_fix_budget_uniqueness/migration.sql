-- DropIndex
DROP INDEX "Budget_userId_categoryId_month_year_key";

-- Prisma schema syntax cannot express partial unique indexes. PostgreSQL treats
-- NULL values as distinct in ordinary unique indexes, so use complementary
-- partial indexes to enforce both budget invariants while keeping categoryId nullable.
CREATE UNIQUE INDEX "Budget_userId_month_year_overall_key"
ON "Budget"("userId", "month", "year")
WHERE "categoryId" IS NULL;

CREATE UNIQUE INDEX "Budget_userId_categoryId_month_year_category_key"
ON "Budget"("userId", "categoryId", "month", "year")
WHERE "categoryId" IS NOT NULL;
