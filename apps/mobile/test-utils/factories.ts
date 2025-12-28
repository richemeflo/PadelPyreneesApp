import type { AuthState } from "@/context/AuthContext";

export function buildAuthState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    playerId: "player-1",
    idToken: "token-123",
    ...overrides,
  };
}
