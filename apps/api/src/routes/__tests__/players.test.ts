import request from "supertest";

import { app } from "../../app";
import { signAuthToken } from "../../lib/jwt";
import { geocodeAddress } from "../../services/geocoding";
import { buildPlayer, buildPlayerCreatePayload } from "../../test-utils/factories";
import { mockVerifyIdToken } from "../../test-utils/firebase";
import { prismaMock } from "../../test-utils/prisma";

jest.mock("../../services/geocoding", () => ({
  geocodeAddress: jest.fn(),
}));

const buildAuthHeader = (uid = "player-1", email = "player@test.com") =>
  `Bearer ${signAuthToken({ uid, email })}`;

describe("players routes", () => {
  const authHeader = buildAuthHeader();

  beforeEach(() => {
    mockVerifyIdToken.mockResolvedValue({
      uid: "player-1",
      email: "player@test.com",
    });
  });

  it("returns 401 when creating a player without auth", async () => {
    const response = await request(app).post("/players").send(buildPlayerCreatePayload());

    expect(response.status).toBe(401);
    expect(prismaMock.player.create).not.toHaveBeenCalled();
  });

  it("returns 400 when create payload is invalid", async () => {
    const response = await request(app)
      .post("/players")
      .set("Authorization", authHeader)
      .send({ email: "not-an-email" });

    expect(response.status).toBe(400);
    expect(prismaMock.player.create).not.toHaveBeenCalled();
  });

  it("returns 403 when email does not match authenticated user", async () => {
    const payload = buildPlayerCreatePayload({ email: "other@test.com" });

    const response = await request(app)
      .post("/players")
      .set("Authorization", authHeader)
      .send(payload);

    expect(response.status).toBe(403);
    expect(prismaMock.player.create).not.toHaveBeenCalled();
  });

  it("creates a player with the authenticated uid", async () => {
    const payload = buildPlayerCreatePayload();
    const created = buildPlayer({ id: "player-1", email: payload.email });
    prismaMock.player.create.mockResolvedValue(created);

    const response = await request(app)
      .post("/players")
      .set("Authorization", authHeader)
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ id: "player-1", email: payload.email });
    expect(prismaMock.player.create).toHaveBeenCalledWith({
      data: {
        ...payload,
        id: "player-1",
        email: payload.email,
      },
    });
  });

  it("returns 404 when player is not found", async () => {
    prismaMock.player.findUnique.mockResolvedValue(null);

    const response = await request(app).get("/players/player-404");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Player not found" });
  });

  it("returns player details when found", async () => {
    const player = buildPlayer({ id: "player-2" });
    prismaMock.player.findUnique.mockResolvedValue({
      ...player,
      ratingHistory: [],
      pairsAsA: [],
      pairsAsB: [],
    });

    const response = await request(app).get("/players/player-2");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: "player-2", email: player.email });
    expect(prismaMock.player.findUnique).toHaveBeenCalledWith({
      where: { id: "player-2" },
      select: expect.any(Object),
    });
  });
});

describe("players geolocation routes", () => {
  const authHeader = buildAuthHeader();
  const geocodeAddressMock = geocodeAddress as jest.MockedFunction<typeof geocodeAddress>;

  beforeEach(() => {
    mockVerifyIdToken.mockResolvedValue({
      uid: "player-1",
      email: "player@test.com",
    });
  });

  it("updates player address with geocoding", async () => {
    geocodeAddressMock.mockResolvedValue({
      lat: 43.6,
      lon: 1.44,
      formattedAddress: "15 Rue du Padel, Toulouse",
      provider: "nominatim",
    });

    prismaMock.$queryRaw.mockResolvedValueOnce([
      {
        id: "player-1",
        email: "player@test.com",
        pseudo: "Player One",
        locale: "fr",
        lat: 43.6,
        lon: 1.44,
        streetNumber: "15",
        streetName: "Rue du Padel",
        city: "Toulouse",
        postalCode: "31000",
        country: "FR",
        formattedAddress: "15 Rue du Padel, Toulouse",
      },
    ]);

    const response = await request(app)
      .put("/players/me/address")
      .set("Authorization", authHeader)
      .send({
        streetNumber: "15",
        streetName: "Rue du Padel",
        city: "Toulouse",
        postalCode: "31000",
        country: "FR",
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: "player-1",
      lat: 43.6,
      lon: 1.44,
      address: {
        streetNumber: "15",
        streetName: "Rue du Padel",
        city: "Toulouse",
        postalCode: "31000",
        country: "FR",
      },
    });
    expect(geocodeAddressMock).toHaveBeenCalled();
    expect(prismaMock.$queryRaw).toHaveBeenCalled();
  });

  it("rejects invalid address payload", async () => {
    const response = await request(app)
      .put("/players/me/address")
      .set("Authorization", authHeader)
      .send({ city: "Toulouse" });

    expect(response.status).toBe(400);
    expect(geocodeAddressMock).not.toHaveBeenCalled();
    expect(prismaMock.$queryRaw).not.toHaveBeenCalled();
  });

  it("returns nearby players", async () => {
    prismaMock.$queryRaw.mockResolvedValueOnce([
      {
        id: "player-1",
        pseudo: "Player One",
        locale: "fr",
        elo: 1200,
        lat: 43.6,
        lon: 1.44,
        distance_m: 1200,
      },
    ]);

    const response = await request(app).get(
      "/players/nearby?lat=43.6&lon=1.44&radiusKm=50",
    );

    expect(response.status).toBe(200);
    expect(response.body.players).toHaveLength(1);
    expect(response.body.players[0]).toMatchObject({
      id: "player-1",
      distanceMeters: 1200,
    });
  });
});
