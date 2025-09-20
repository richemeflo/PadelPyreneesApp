-- CreateTable
CREATE TABLE "public"."MatchmakingAvailability" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatchmakingAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchProposal" (
    "id" TEXT NOT NULL,
    "requesterPairId" TEXT NOT NULL,
    "opponentPairId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "locationLat" DOUBLE PRECISION NOT NULL,
    "locationLon" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatchProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchProposalAcceptance" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatchProposalAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchmakingAvailability_playerId_idx" ON "public"."MatchmakingAvailability"("playerId");
CREATE INDEX "MatchmakingAvailability_start_idx" ON "public"."MatchmakingAvailability"("start");
CREATE INDEX "MatchmakingAvailability_end_idx" ON "public"."MatchmakingAvailability"("end");

CREATE INDEX "MatchProposal_requesterPairId_idx" ON "public"."MatchProposal"("requesterPairId");
CREATE INDEX "MatchProposal_opponentPairId_idx" ON "public"."MatchProposal"("opponentPairId");
CREATE INDEX "MatchProposal_start_idx" ON "public"."MatchProposal"("start");
CREATE INDEX "MatchProposal_end_idx" ON "public"."MatchProposal"("end");

CREATE UNIQUE INDEX "MatchProposalAcceptance_proposalId_pairId_key" ON "public"."MatchProposalAcceptance"("proposalId", "pairId");
CREATE INDEX "MatchProposalAcceptance_pairId_idx" ON "public"."MatchProposalAcceptance"("pairId");

-- AddForeignKey
ALTER TABLE "public"."MatchmakingAvailability"
  ADD CONSTRAINT "MatchmakingAvailability_playerId_fkey"
  FOREIGN KEY ("playerId") REFERENCES "public"."Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."MatchProposal"
  ADD CONSTRAINT "MatchProposal_requesterPairId_fkey"
  FOREIGN KEY ("requesterPairId") REFERENCES "public"."Pair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."MatchProposal"
  ADD CONSTRAINT "MatchProposal_opponentPairId_fkey"
  FOREIGN KEY ("opponentPairId") REFERENCES "public"."Pair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."MatchProposalAcceptance"
  ADD CONSTRAINT "MatchProposalAcceptance_proposalId_fkey"
  FOREIGN KEY ("proposalId") REFERENCES "public"."MatchProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."MatchProposalAcceptance"
  ADD CONSTRAINT "MatchProposalAcceptance_pairId_fkey"
  FOREIGN KEY ("pairId") REFERENCES "public"."Pair"("id") ON DELETE CASCADE ON UPDATE CASCADE;
