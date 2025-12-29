-- CreateTable
CREATE TABLE "public"."AuthEvent" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuthEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuthEvent_playerId_idx" ON "public"."AuthEvent"("playerId");
CREATE INDEX "AuthEvent_type_idx" ON "public"."AuthEvent"("type");
CREATE INDEX "AuthEvent_createdAt_idx" ON "public"."AuthEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."AuthEvent"
  ADD CONSTRAINT "AuthEvent_playerId_fkey"
  FOREIGN KEY ("playerId") REFERENCES "public"."Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
