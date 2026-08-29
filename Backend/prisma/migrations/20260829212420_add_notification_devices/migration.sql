-- CreateTable
CREATE TABLE "NotificationDevice" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "pushToken" VARCHAR(512) NOT NULL,
    "platform" VARCHAR(16) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDevice_pushToken_key" ON "NotificationDevice"("pushToken");

-- CreateIndex
CREATE INDEX "NotificationDevice_userId_idx" ON "NotificationDevice"("userId");

-- CreateIndex
CREATE INDEX "NotificationDevice_enabled_idx" ON "NotificationDevice"("enabled");

-- AddForeignKey
ALTER TABLE "NotificationDevice" ADD CONSTRAINT "NotificationDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
