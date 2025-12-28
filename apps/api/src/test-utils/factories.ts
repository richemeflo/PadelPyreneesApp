import type { Player } from "@prisma/client";

type PlayerCreatePayload = {
  email: string;
  pseudo: string;
  passwordHash: string;
  locale?: string;
  lat?: number;
  lon?: number;
};

const basePlayer: Player = {
  id: "player-1",
  email: "player@test.com",
  pseudo: "Player One",
  passwordHash: "hashed-password-123",
  locale: "fr",
  lat: 43.6,
  lon: 1.44,
  elo: 1000,
  createdAt: new Date("2024-01-01T10:00:00Z"),
  updatedAt: new Date("2024-01-02T10:00:00Z"),
};

export function buildPlayer(overrides: Partial<Player> = {}): Player {
  return { ...basePlayer, ...overrides };
}

export function buildPlayerCreatePayload(overrides: Partial<PlayerCreatePayload> = {}): PlayerCreatePayload {
  return {
    email: "player@test.com",
    pseudo: "Player One",
    passwordHash: "hashed-password-123",
    locale: "fr",
    lat: 43.6,
    lon: 1.44,
    ...overrides,
  };
}
