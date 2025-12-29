import request from "supertest";

import { app } from "../../app";
import { prismaMock } from "../../test-utils/prisma";

describe("tournaments nearby routes", () => {
  it("returns nearby tournaments", async () => {
    prismaMock.$queryRaw.mockResolvedValueOnce([
      {
        id: "tournament-1",
        name: "Summer Open",
        desc: null,
        kind: "internal",
        startsAt: new Date("2025-06-01T10:00:00Z"),
        endsAt: new Date("2025-06-02T10:00:00Z"),
        place: "Toulouse",
        city: "Toulouse",
        postalCode: "31000",
        country: "FR",
        lat: 43.6,
        lon: 1.44,
        distance_m: 5000,
      },
    ]);

    const response = await request(app).get(
      "/tournaments/nearby?lat=43.6&lon=1.44&radiusKm=50",
    );

    expect(response.status).toBe(200);
    expect(response.body.tournaments).toHaveLength(1);
    expect(response.body.tournaments[0]).toMatchObject({
      id: "tournament-1",
      distanceMeters: 5000,
    });
  });
});
