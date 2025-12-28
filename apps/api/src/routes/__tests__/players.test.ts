import request from "supertest";

import { app } from "../../app";
import { buildPlayer, buildPlayerCreatePayload } from "../../test-utils/factories";
import { mockVerifyIdToken } from "../../test-utils/firebase";
import { prismaMock } from "../../test-utils/prisma";

describe("players routes", () => {
  const authHeader = "Bearer test-token";

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
