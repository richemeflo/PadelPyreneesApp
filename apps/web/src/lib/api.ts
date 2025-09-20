import axios from "axios";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export const api = axios.create({
  baseURL: apiBaseUrl,
});

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("idToken");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function fetchPlayer(playerId: string) {
  const response = await api.get(`/players/${playerId}`);
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
