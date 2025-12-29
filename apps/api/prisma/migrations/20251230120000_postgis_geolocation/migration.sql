CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE "Player"
  ADD COLUMN "street_number" TEXT,
  ADD COLUMN "street_name" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "city" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "postal_code" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "country" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "formatted_address" TEXT,
  ADD COLUMN "home_location" geography(Point, 4326);

ALTER TABLE "Club"
  ADD COLUMN "city" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "postal_code" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "country" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "formatted_address" TEXT,
  ADD COLUMN "location" geography(Point, 4326);

ALTER TABLE "Tournament"
  ADD COLUMN "city" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "postal_code" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "country" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "formatted_address" TEXT,
  ADD COLUMN "location" geography(Point, 4326);

UPDATE "Player"
SET "home_location" = ST_SetSRID(ST_MakePoint("lon", "lat"), 4326)::geography
WHERE "lat" IS NOT NULL AND "lon" IS NOT NULL AND "home_location" IS NULL;

UPDATE "Club"
SET "location" = ST_SetSRID(ST_MakePoint("lon", "lat"), 4326)::geography
WHERE "location" IS NULL;

UPDATE "Tournament" AS t
SET "location" = c."location"
FROM "Club" AS c
WHERE t."externalClubId" = c.id AND t."location" IS NULL;

CREATE INDEX "Player_home_location_gist_idx" ON "Player" USING GIST ("home_location");
CREATE INDEX "Player_city_idx" ON "Player" ("city");
CREATE INDEX "Player_postal_code_idx" ON "Player" ("postal_code");

CREATE INDEX "Club_location_gist_idx" ON "Club" USING GIST ("location");
CREATE INDEX "Club_city_idx" ON "Club" ("city");
CREATE INDEX "Club_postal_code_idx" ON "Club" ("postal_code");

CREATE INDEX "Tournament_location_gist_idx" ON "Tournament" USING GIST ("location");
CREATE INDEX "Tournament_city_idx" ON "Tournament" ("city");
CREATE INDEX "Tournament_postal_code_idx" ON "Tournament" ("postal_code");
