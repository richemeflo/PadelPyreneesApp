export type AuthState = {
  playerId: string;
  idToken: string;
};

const PLAYER_ID_KEY = "playerId";
const ID_TOKEN_KEY = "idToken";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getStoredPlayerId(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(PLAYER_ID_KEY);
}

export function getStoredIdToken(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(ID_TOKEN_KEY);
}

export function getStoredAuth(): AuthState | null {
  const playerId = getStoredPlayerId();
  const idToken = getStoredIdToken();
  if (!playerId || !idToken) return null;
  return { playerId, idToken };
}

export function setStoredAuth(auth: AuthState) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(PLAYER_ID_KEY, auth.playerId);
  window.localStorage.setItem(ID_TOKEN_KEY, auth.idToken);
}

export function clearStoredAuth() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(PLAYER_ID_KEY);
  window.localStorage.removeItem(ID_TOKEN_KEY);
}
