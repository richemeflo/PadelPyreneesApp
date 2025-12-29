import request from "supertest";

import { app } from "../../app";
import { prismaMock } from "../../test-utils/prisma";

describe("clubs for match routes", () => {
  it("returns clubs sorted by distance for four players", async () => {
    prismaMock.$queryRaw
      .mockResolvedValueOnce([
        { id: "p1", lat: 43.6, lon: 1.4 },
        { id: "p2", lat: 43.8, lon: 1.6 },
        { id: "p3", lat: 43.7, lon: 1.5 },
        { id: "p4", lat: 43.5, lon: 1.3 },
      ])
      .mockResolvedValueOnce([
        {
          id: "club-1",
          name: "Club One",
          address: "1 Rue du Club",
          city: "Toulouse",
          postalCode: "31000",
          country: "FR",
          logoUrl: null,
          lat: 43.61,
          lon: 1.41,
          distance_m: 900,
        },
        {
          id: "club-2",
          name: "Club Two",
          address: "2 Rue du Club",
          city: "Toulouse",
          postalCode: "31000",
          country: "FR",
          logoUrl: null,
          lat: 43.7,
          lon: 1.6,
          distance_m: 2400,
        },
      ]);

    const response = await request(app).get(
      "/clubs/for-match?playerIds=p1,p2,p3,p4&limit=2",
    );

    expect(response.status).toBe(200);
    expect(response.body.clubs).toHaveLength(2);
    expect(response.body.center.lat).toBeCloseTo(43.65, 2);
    expect(response.body.center.lon).toBeCloseTo(1.45, 2);
    expect(response.body.clubs[0].distanceMeters).toBeLessThanOrEqual(
      response.body.clubs[1].distanceMeters,
    );
  });
});
