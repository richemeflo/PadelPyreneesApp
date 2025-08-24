import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { PlayerWithHistory } from '../types/player';

interface TopPlayersCardsProps {
  players: PlayerWithHistory[];
}

export function TopPlayersCards({ players }: TopPlayersCardsProps) {
  const topThree = players.slice(0, 3);

  const getTrophyIcon = (rank: number) => {
    const colors = {
      1: 'text-yellow-500',
      2: 'text-gray-400', 
      3: 'text-amber-600'
    };
    return <Trophy className={`h-5 w-5 ${colors[rank as keyof typeof colors]}`} />;
  };

  const getEvolutionIcon = (evolution: number) => {
    if (evolution > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (evolution < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    return total > 0 ? Math.round((wins / total) * 100) : 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {topThree.map((player) => (
        <Card key={player.id} className="relative overflow-hidden border-2 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {getTrophyIcon(player.rank)}
                <span className="text-sm text-muted-foreground">#{player.rank}</span>
              </div>
              <Badge variant={player.evolution >= 0 ? "default" : "destructive"} className="text-xs">
                <div className="flex items-center gap-1">
                  {getEvolutionIcon(player.evolution)}
                  {player.evolution > 0 ? '+' : ''}{player.evolution}
                </div>
              </Badge>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-16 w-16 mb-3">
                <AvatarImage src={player.avatar} alt={player.pseudo} />
                <AvatarFallback>{player.pseudo.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <h3 className="mb-1">{player.pseudo}</h3>
              <p className="text-2xl mb-2">{player.eloPoints}</p>
              <p className="text-sm text-muted-foreground mb-2">
                {getWinRate(player.wins, player.losses)}% victoires
              </p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{player.wins}V</span>
                <span>•</span>
                <span>{player.losses}D</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}