import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../src/lib/passwords";

const prisma = new PrismaClient();

async function seedPlayers() {
  const passwordHash = await hashPassword("demo");
  const players = [
    {
      id: "auth-user-alice",
      email: "alice@example.com",
      pseudo: "PadelAlice",
      passwordHash,
      locale: "fr",
      lat: 43.6045,
      lon: 1.444,
      streetNumber: "15",
      streetName: "Rue du Padel",
      city: "Toulouse",
      postalCode: "31000",
      country: "FR",
      elo: 1520,
    },
    {
      id: "auth-user-bob",
      email: "bob@example.com",
      pseudo: "Bobissimo",
      passwordHash,
      locale: "fr",
      lat: 43.2951,
      lon: -0.366,
      streetNumber: "8",
      streetName: "Allee des Sports",
      city: "Pau",
      postalCode: "64000",
      country: "FR",
      elo: 1495,
    },
    {
      id: "auth-user-carol",
      email: "carol@example.com",
      pseudo: "CarolPadel",
      passwordHash,
      locale: "es",
      lat: 42.8169,
      lon: -1.6432,
      streetNumber: "1",
      streetName: "Avenida del Padel",
      city: "Pamplona",
      postalCode: "31001",
      country: "ES",
      elo: 1450,
    },
    {
      id: "auth-user-dan",
      email: "dan@example.com",
      pseudo: "DanServe",
      passwordHash,
      locale: "en",
      lat: 43.232,
      lon: 0.079,
      streetNumber: "12",
      streetName: "Route des Pyrenees",
      city: "Tarbes",
      postalCode: "65000",
      country: "FR",
      elo: 1380,
    },
  ];

  await Promise.all(
    players.map((player) =>
      prisma.player.upsert({
        where: { id: player.id },
        update: {
          email: player.email,
          pseudo: player.pseudo,
          passwordHash: player.passwordHash,
          locale: player.locale,
          lat: player.lat,
          lon: player.lon,
          streetNumber: player.streetNumber,
          streetName: player.streetName,
          city: player.city,
          postalCode: player.postalCode,
          country: player.country,
          elo: player.elo,
        },
        create: player,
      }),
    ),
  );

  await prisma.$executeRaw`
    UPDATE "Player"
    SET "home_location" = ST_SetSRID(ST_MakePoint("lon", "lat"), 4326)::geography
    WHERE "lat" IS NOT NULL AND "lon" IS NOT NULL;
  `;
}

async function seedPairs() {
  const pairs = [
    {
      id: "pair-alice-bob",
      lId: "auth-user-alice",
      rId: "auth-user-bob",
      pairKey: ["auth-user-alice", "auth-user-bob"].sort().join("::"),
      elo: 1485,
    },
    {
      id: "pair-carol-dan",
      lId: "auth-user-carol",
      rId: "auth-user-dan",
      pairKey: ["auth-user-carol", "auth-user-dan"].sort().join("::"),
      elo: 1410,
    },
  ];

  await Promise.all(
    pairs.map((pair) =>
      prisma.pair.upsert({
        where: { id: pair.id },
        update: { elo: pair.elo, pairKey: pair.pairKey },
        create: pair,
      }),
    ),
  );
}

async function seedClubsAndCourts() {
  const clubs = [
    {
      id: "club-viapadel",
      name: "ViaPadel",
      address: "15 Rue du Padel, Toulouse",
      city: "Toulouse",
      postalCode: "31000",
      country: "FR",
      lat: 43.561,
      lon: 1.482,
      apiKind: "viapadel",
      courts: [
        { id: "court-viapadel-1", name: "Court Central" },
        { id: "court-viapadel-2", name: "Court Lateral" },
      ],
    },
    {
      id: "club-bruyeres",
      name: "Centre des Bruyeres",
      address: "8 Allee des Sports, Pau",
      city: "Pau",
      postalCode: "64000",
      country: "FR",
      lat: 43.3,
      lon: -0.365,
      apiKind: "bruyeres",
      courts: [
        { id: "court-bruyeres-1", name: "Bruyeres A" },
        { id: "court-bruyeres-2", name: "Bruyeres B" },
      ],
    },
  ];

  for (const club of clubs) {
    await prisma.club.upsert({
      where: { id: club.id },
      update: {
        name: club.name,
        address: club.address,
        city: club.city,
        postalCode: club.postalCode,
        country: club.country,
        lat: club.lat,
        lon: club.lon,
        apiKind: club.apiKind,
      },
      create: {
        id: club.id,
        name: club.name,
        address: club.address,
        city: club.city,
        postalCode: club.postalCode,
        country: club.country,
        lat: club.lat,
        lon: club.lon,
        apiKind: club.apiKind,
      },
    });

    for (const court of club.courts) {
      await prisma.court.upsert({
        where: { id: court.id },
        update: { name: court.name, clubId: club.id },
        create: { ...court, clubId: club.id },
      });
    }
  }

  await prisma.$executeRaw`
    UPDATE "Club"
    SET "location" = ST_SetSRID(ST_MakePoint("lon", "lat"), 4326)::geography
    WHERE "lat" IS NOT NULL AND "lon" IS NOT NULL;
  `;
}

async function seedTournaments() {
  const tournaments = [
    {
      id: "tournament-summer-open",
      kind: "internal",
      createdBy: "auth-user-alice",
      name: "Summer Open Occitanie",
      desc: "Tournoi interne ouvert a tous",
      levelMin: 1200,
      levelMax: 1700,
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      place: "Toulouse",
      city: "Toulouse",
      postalCode: "31000",
      country: "FR",
      price: 2500,
      locationLat: 43.6045,
      locationLon: 1.444,
    },
    {
      id: "tournament-bruyeres-cup",
      kind: "external",
      createdBy: "auth-user-bob",
      externalClubId: "club-bruyeres",
      name: "Bruyeres Cup",
      desc: "Tournoi partenaire",
      levelMin: 1300,
      levelMax: 1600,
      startsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      place: "Pau",
      city: "Pau",
      postalCode: "64000",
      country: "FR",
      price: 3000,
    },
  ];

  await Promise.all(
    tournaments.map((tournament) =>
      prisma.tournament.upsert({
        where: { id: tournament.id },
        update: {
          kind: tournament.kind,
          createdBy: tournament.createdBy,
          externalClubId: tournament.externalClubId,
          name: tournament.name,
          desc: tournament.desc,
          levelMin: tournament.levelMin,
          levelMax: tournament.levelMax,
          startsAt: tournament.startsAt,
          endsAt: tournament.endsAt,
          place: tournament.place,
          city: tournament.city,
          postalCode: tournament.postalCode,
          country: tournament.country,
          price: tournament.price,
        },
        create: {
          id: tournament.id,
          kind: tournament.kind,
          createdBy: tournament.createdBy,
          externalClubId: tournament.externalClubId,
          name: tournament.name,
          desc: tournament.desc,
          levelMin: tournament.levelMin,
          levelMax: tournament.levelMax,
          startsAt: tournament.startsAt,
          endsAt: tournament.endsAt,
          place: tournament.place,
          city: tournament.city,
          postalCode: tournament.postalCode,
          country: tournament.country,
          price: tournament.price,
        },
      }),
    ),
  );

  for (const tournament of tournaments) {
    if (tournament.locationLat !== undefined && tournament.locationLon !== undefined) {
      await prisma.$executeRaw`
        UPDATE "Tournament"
        SET "location" = ST_SetSRID(ST_MakePoint(${tournament.locationLon}, ${tournament.locationLat}), 4326)::geography
        WHERE id = ${tournament.id};
      `;
    }
  }

  await prisma.$executeRaw`
    UPDATE "Tournament" AS t
    SET "location" = c."location"
    FROM "Club" AS c
    WHERE t."externalClubId" = c.id;
  `;
}

async function main() {
  await seedPlayers();
  await seedPairs();
  await seedClubsAndCourts();
  await seedTournaments();
}

main()
  .then(() => {
    console.log("Seed data applied");
  })
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
