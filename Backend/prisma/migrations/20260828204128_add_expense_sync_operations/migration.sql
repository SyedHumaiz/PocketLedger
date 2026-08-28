-- CreateTable
CREATE TABLE "ProcessedOperation" (
    "id" UUID NOT NULL,
    "operationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "operationType" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "resultJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedOperation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcessedOperation_userId_entityType_entityId_idx" ON "ProcessedOperation"("userId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "ProcessedOperation_createdAt_idx" ON "ProcessedOperation"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedOperation_userId_operationId_key" ON "ProcessedOperation"("userId", "operationId");

-- AddForeignKey
ALTER TABLE "ProcessedOperation" ADD CONSTRAINT "ProcessedOperation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
