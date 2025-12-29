import axios from "axios";

import { getStoredIdToken } from "./auth";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export const api = axios.create({
  baseURL: apiBaseUrl,
});

function getAuthHeaders() {
  const token = getStoredIdToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

type AuthResponse = {
  token: string;
  player: {
    id: string;
    email: string;
    pseudo: string;
    locale: string;
  };
};

export async function fetchPlayer(playerId: string) {
  const response = await api.get(`/players/${playerId}`);
  return response.data;
}

export async function updatePlayer(
  playerId: string,
  payload: { pseudo?: string; locale?: string; lat?: number; lon?: number },
) {
  const response = await api.patch(`/players/${playerId}`, payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function fetchTournaments(limit = 5) {
  const response = await api.get("/tournaments", {
    params: { limit },
  });
  return response.data as Array<{
    id: string;
    name: string;
    desc?: string | null;
    startsAt: string;
    place?: string | null;
    participantCount?: number;
    isRegistered?: boolean;
  }>;
}

export async function fetchMatchmakingProposals(pairId: string) {
  const response = await api.get("/matchmaking/proposals", {
    params: { pairId },
    headers: getAuthHeaders(),
  });
  return response.data.proposals as Array<{
    id: string;
    requesterPairId: string;
    opponentPairId: string;
    start: string;
    end: string;
    location: { lat: number; lon: number };
    acceptedPairIds: string[];
    createdAt: string;
  }>;
}

export async function fetchRanking(params: { region?: string; limit?: number } = {}) {
  const response = await api.get("/ranking", {
    params: {
      limit: params.limit ?? 50,
      region: params.region,
    },
  });

  return response.data as {
    total: number;
    region: string | null;
    players: Array<{
      id: string;
      pseudo: string;
      elo: number;
      rank: number;
      distanceKm?: number;
      locale?: string;
    }>;
  };
}

export async function logoutUser() {
  await api.post(
    "/auth/logout",
    {},
    {
      headers: getAuthHeaders(),
    },
  );
}

export async function signInUser(payload: { identifier: string; password: string }) {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  return response.data;
}

export async function registerUser(payload: {
  email: string;
  pseudo: string;
  password: string;
}) {
  const response = await api.post<AuthResponse>("/auth/register", payload);
  return response.data;
}

export async function logNavigation(path: string) {
  await api.post(
    "/auth/activity",
    { path },
    {
      headers: getAuthHeaders(),
    },
  );
}
