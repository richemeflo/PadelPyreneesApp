import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const getWinRate = (wins: number, losses: number) => {
  const total = wins + losses;
  return total > 0 ? Math.round((wins / total) * 100) : 0;
};

export const getEvolutionIcon = (evolution: number, showNeutral = false) => {
  if (evolution > 0) {
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  }
  if (evolution < 0) {
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  }
  return showNeutral ? <Minus className="h-4 w-4 text-muted-foreground" /> : null;
};
