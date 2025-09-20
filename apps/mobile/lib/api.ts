import axios from 'axios';

import type { AuthState } from '@/context/AuthContext';

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export const api = axios.create({ baseURL });

function authHeaders(auth: AuthState | null) {
  if (!auth?.idToken) return {};
  return { Authorization: `Bearer ${auth.idToken}` };
}

export async function fetchPlayer(auth: AuthState | null, playerId: string) {
  const response = await api.get(`/players/${playerId}`, {
    headers: authHeaders(auth),
  });
  return response.data;
}

export async function fetchTournaments(auth: AuthState | null, limit = 5) {
  const response = await api.get('/tournaments', {
    params: { limit },
    headers: authHeaders(auth),
  });
  return response.data as Array<{
    id: string;
    name: string;
    startsAt: string;
    place?: string | null;
    desc?: string | null;
  }>;
}

export async function createMatch(auth: AuthState | null, payload: {
  pairAId: string;
  pairBId: string;
  startsAt: string;
  courtId?: string;
}) {
  const response = await api.post('/matches', payload, {
    headers: authHeaders(auth),
  });
  return response.data;
}
