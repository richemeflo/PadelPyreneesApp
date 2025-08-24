export type FilterPeriod = '7j' | '1m' | '3m' | '6m' | '1an';

export type SortField = 'rank' | 'pseudo' | 'eloPoints' | 'winRate';
export type SortDirection = 'asc' | 'desc';

export interface EloHistoryPoint {
  date: string;
  elo: number;
}

export interface PlayerWithHistory {
  id: string;
  pseudo: string;
  avatar: string;
  gender: string;
  category: string;
  rank: number;
  eloPoints: number;
  evolution: number;
  wins: number;
  losses: number;
  history?: EloHistoryPoint[];
}
