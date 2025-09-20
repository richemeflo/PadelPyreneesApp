import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedPlayers() {
  const players = [
    {
      id: "auth-user-alice",
      email: "alice@example.com",
      pseudo: "PadelAlice",
      passwordHash: "demo-hash",
      locale: "fr",
      lat: 43.6045,
      lon: 1.444,
      elo: 1520,
    },
    {
      id: "auth-user-bob",
      email: "bob@example.com",
      pseudo: "Bobissimo",
      passwordHash: "demo-hash",
      locale: "fr",
      lat: 43.2951,
      lon: -0.366,
      elo: 1495,
    },
    {
      id: "auth-user-carol",
      email: "carol@example.com",
      pseudo: "CarolPadel",
      passwordHash: "demo-hash",
      locale: "es",
      lat: 42.8169,
      lon: -1.6432,
      elo: 1450,
    },
    {
      id: "auth-user-dan",
      email: "dan@example.com",
      pseudo: "DanServe",
      passwordHash: "demo-hash",
      locale: "en",
      lat: 43.232,
      lon: 0.079,
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
          elo: player.elo,
        },
        create: player,
      }),
    ),
  );
}

async function seedPairs() {
  const pairs = [
    {
      id: "pair-alice-bob",
      lId: "auth-user-alice",
      rId: "auth-user-bob",
      elo: 1485,
    },
    {
      id: "pair-carol-dan",
      lId: "auth-user-carol",
      rId: "auth-user-dan",
      elo: 1410,
    },
  ];

  await Promise.all(
    pairs.map((pair) =>
      prisma.pair.upsert({
        where: { id: pair.id },
        update: { elo: pair.elo },
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
      lat: 43.561,
      lon: 1.482,
      apiKind: "viapadel",
      courts: [
        { id: "court-viapadel-1", name: "Court Central" },
        { id: "court-viapadel-2", name: "Court Latéral" },
      ],
    },
    {
      id: "club-bruyeres",
      name: "Centre des Bruyères",
      address: "8 Allée des Sports, Pau",
      lat: 43.3,
      lon: -0.365,
      apiKind: "bruyeres",
      courts: [
        { id: "court-bruyeres-1", name: "Bruyères A" },
        { id: "court-bruyeres-2", name: "Bruyères B" },
      ],
    },
  ];

  for (const club of clubs) {
    await prisma.club.upsert({
      where: { id: club.id },
      update: {
        name: club.name,
        address: club.address,
        lat: club.lat,
        lon: club.lon,
        apiKind: club.apiKind,
      },
      create: {
        id: club.id,
        name: club.name,
        address: club.address,
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
}

async function seedTournaments() {
  const tournaments = [
    {
      id: "tournament-summer-open",
      kind: "internal",
      createdBy: "auth-user-alice",
      name: "Summer Open Occitanie",
      desc: "Tournoi interne ouvert à tous",
      levelMin: 1200,
      levelMax: 1700,
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      place: "Toulouse",
      price: 2500,
    },
    {
      id: "tournament-bruyeres-cup",
      kind: "external",
      createdBy: "auth-user-bob",
      externalClubId: "club-bruyeres",
      name: "Bruyères Cup",
      desc: "Tournoi partenaire",
      levelMin: 1300,
      levelMax: 1600,
      startsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      place: "Pau",
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
          price: tournament.price,
        },
        create: tournament,
      }),
    ),
  );
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
