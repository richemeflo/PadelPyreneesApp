-- AddColumn
ALTER TABLE "public"."Pair" ADD COLUMN "pairKey" TEXT;

UPDATE "public"."Pair"
SET "pairKey" = CASE
  WHEN "lId" <= "rId" THEN "lId" || '::' || "rId"
  ELSE "rId" || '::' || "lId"
END;

ALTER TABLE "public"."Pair" ALTER COLUMN "pairKey" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."MatchScoreSubmission" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "winnerPairId" TEXT NOT NULL,
    "score" TEXT NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatchScoreSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchScoreConfirmation" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatchScoreConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchReview" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "targetPairId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "fairPlay" INTEGER NOT NULL,
    "skill" INTEGER NOT NULL,
    "rematchInterest" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatchReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TournamentRegistration" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TournamentRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReservationSuggestion" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "provider" TEXT NOT NULL,
    "estimatedPrice" INTEGER,
    "currency" TEXT,
    "distanceKm" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    CONSTRAINT "ReservationSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reservation" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "courtId" TEXT,
    "userId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "provider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pair_pairKey_key" ON "public"."Pair"("pairKey");

CREATE UNIQUE INDEX "MatchScoreSubmission_matchId_key" ON "public"."MatchScoreSubmission"("matchId");
CREATE INDEX "MatchScoreSubmission_winnerPairId_idx" ON "public"."MatchScoreSubmission"("winnerPairId");
CREATE INDEX "MatchScoreSubmission_submittedBy_idx" ON "public"."MatchScoreSubmission"("submittedBy");

CREATE UNIQUE INDEX "MatchScoreConfirmation_submissionId_playerId_key" ON "public"."MatchScoreConfirmation"("submissionId", "playerId");
CREATE INDEX "MatchScoreConfirmation_pairId_idx" ON "public"."MatchScoreConfirmation"("pairId");
CREATE INDEX "MatchScoreConfirmation_playerId_idx" ON "public"."MatchScoreConfirmation"("playerId");

CREATE INDEX "MatchReview_matchId_idx" ON "public"."MatchReview"("matchId");
CREATE INDEX "MatchReview_authorId_idx" ON "public"."MatchReview"("authorId");

CREATE UNIQUE INDEX "TournamentRegistration_tournamentId_playerId_key" ON "public"."TournamentRegistration"("tournamentId", "playerId");
CREATE INDEX "TournamentRegistration_playerId_idx" ON "public"."TournamentRegistration"("playerId");

CREATE INDEX "ReservationSuggestion_userId_idx" ON "public"."ReservationSuggestion"("userId");
CREATE INDEX "ReservationSuggestion_createdAt_idx" ON "public"."ReservationSuggestion"("createdAt");

CREATE INDEX "Reservation_clubId_idx" ON "public"."Reservation"("clubId");
CREATE INDEX "Reservation_courtId_idx" ON "public"."Reservation"("courtId");
CREATE INDEX "Reservation_userId_idx" ON "public"."Reservation"("userId");
CREATE INDEX "Reservation_start_idx" ON "public"."Reservation"("start");
CREATE INDEX "Reservation_end_idx" ON "public"."Reservation"("end");

-- AddForeignKey
ALTER TABLE "public"."MatchScoreSubmission"
  ADD CONSTRAINT "MatchScoreSubmission_matchId_fkey"
  FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."MatchScoreSubmission"
  ADD CONSTRAINT "MatchScoreSubmission_winnerPairId_fkey"
  FOREIGN KEY ("winnerPairId") REFERENCES "public"."Pair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."MatchScoreSubmission"
  ADD CONSTRAINT "MatchScoreSubmission_submittedBy_fkey"
  FOREIGN KEY ("submittedBy") REFERENCES "public"."Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."MatchScoreConfirmation"
  ADD CONSTRAINT "MatchScoreConfirmation_submissionId_fkey"
  FOREIGN KEY ("submissionId") REFERENCES "public"."MatchScoreSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."MatchScoreConfirmation"
  ADD CONSTRAINT "MatchScoreConfirmation_playerId_fkey"
  FOREIGN KEY ("playerId") REFERENCES "public"."Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."MatchScoreConfirmation"
  ADD CONSTRAINT "MatchScoreConfirmation_pairId_fkey"
  FOREIGN KEY ("pairId") REFERENCES "public"."Pair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."MatchReview"
  ADD CONSTRAINT "MatchReview_matchId_fkey"
  FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."MatchReview"
  ADD CONSTRAINT "MatchReview_targetPairId_fkey"
  FOREIGN KEY ("targetPairId") REFERENCES "public"."Pair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."MatchReview"
  ADD CONSTRAINT "MatchReview_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "public"."Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."TournamentRegistration"
  ADD CONSTRAINT "TournamentRegistration_tournamentId_fkey"
  FOREIGN KEY ("tournamentId") REFERENCES "public"."Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."TournamentRegistration"
  ADD CONSTRAINT "TournamentRegistration_playerId_fkey"
  FOREIGN KEY ("playerId") REFERENCES "public"."Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."ReservationSuggestion"
  ADD CONSTRAINT "ReservationSuggestion_clubId_fkey"
  FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."ReservationSuggestion"
  ADD CONSTRAINT "ReservationSuggestion_courtId_fkey"
  FOREIGN KEY ("courtId") REFERENCES "public"."Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."ReservationSuggestion"
  ADD CONSTRAINT "ReservationSuggestion_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."Reservation"
  ADD CONSTRAINT "Reservation_clubId_fkey"
  FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."Reservation"
  ADD CONSTRAINT "Reservation_courtId_fkey"
  FOREIGN KEY ("courtId") REFERENCES "public"."Court"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."Reservation"
  ADD CONSTRAINT "Reservation_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
