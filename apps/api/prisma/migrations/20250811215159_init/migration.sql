-- CreateTable
CREATE TABLE "public"."Player" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pseudo" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "elo" INTEGER NOT NULL DEFAULT 1000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "apiKind" TEXT,
    "apiKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Court" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,

    CONSTRAINT "Court_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pair" (
    "id" TEXT NOT NULL,
    "lId" TEXT NOT NULL,
    "rId" TEXT NOT NULL,
    "elo" INTEGER NOT NULL DEFAULT 1000,

    CONSTRAINT "Pair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Match" (
    "id" TEXT NOT NULL,
    "pairAId" TEXT NOT NULL,
    "pairBId" TEXT NOT NULL,
    "courtId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "score" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RatingHistory" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "before" INTEGER NOT NULL,
    "after" INTEGER NOT NULL,
    "delta" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RatingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tournament" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "createdBy" TEXT,
    "externalClubId" TEXT,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "levelMin" INTEGER,
    "levelMax" INTEGER,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "place" TEXT,
    "price" INTEGER,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_email_key" ON "public"."Player"("email");

-- CreateIndex
CREATE INDEX "Player_elo_idx" ON "public"."Player"("elo");

-- CreateIndex
CREATE INDEX "Club_lat_lon_idx" ON "public"."Club"("lat", "lon");

-- CreateIndex
CREATE UNIQUE INDEX "Club_name_address_key" ON "public"."Club"("name", "address");

-- CreateIndex
CREATE INDEX "Court_clubId_idx" ON "public"."Court"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "Court_clubId_name_key" ON "public"."Court"("clubId", "name");

-- CreateIndex
CREATE INDEX "Pair_lId_idx" ON "public"."Pair"("lId");

-- CreateIndex
CREATE INDEX "Pair_rId_idx" ON "public"."Pair"("rId");

-- CreateIndex
CREATE UNIQUE INDEX "Pair_lId_rId_key" ON "public"."Pair"("lId", "rId");

-- CreateIndex
CREATE INDEX "Match_pairAId_idx" ON "public"."Match"("pairAId");

-- CreateIndex
CREATE INDEX "Match_pairBId_idx" ON "public"."Match"("pairBId");

-- CreateIndex
CREATE INDEX "Match_courtId_idx" ON "public"."Match"("courtId");

-- CreateIndex
CREATE INDEX "Match_startsAt_idx" ON "public"."Match"("startsAt");

-- CreateIndex
CREATE INDEX "RatingHistory_playerId_idx" ON "public"."RatingHistory"("playerId");

-- CreateIndex
CREATE INDEX "RatingHistory_matchId_idx" ON "public"."RatingHistory"("matchId");

-- CreateIndex
CREATE INDEX "Tournament_kind_idx" ON "public"."Tournament"("kind");

-- CreateIndex
CREATE INDEX "Tournament_externalClubId_idx" ON "public"."Tournament"("externalClubId");

-- CreateIndex
CREATE INDEX "Tournament_startsAt_idx" ON "public"."Tournament"("startsAt");

-- AddForeignKey
ALTER TABLE "public"."Court" ADD CONSTRAINT "Court_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pair" ADD CONSTRAINT "Pair_lId_fkey" FOREIGN KEY ("lId") REFERENCES "public"."Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pair" ADD CONSTRAINT "Pair_rId_fkey" FOREIGN KEY ("rId") REFERENCES "public"."Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_pairAId_fkey" FOREIGN KEY ("pairAId") REFERENCES "public"."Pair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_pairBId_fkey" FOREIGN KEY ("pairBId") REFERENCES "public"."Pair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "public"."Court"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RatingHistory" ADD CONSTRAINT "RatingHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RatingHistory" ADD CONSTRAINT "RatingHistory_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tournament" ADD CONSTRAINT "Tournament_externalClubId_fkey" FOREIGN KEY ("externalClubId") REFERENCES "public"."Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;
