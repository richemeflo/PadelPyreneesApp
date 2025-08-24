import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PlayerWithHistory, SortField, SortDirection } from '../../types/player';
import { getWinRate, getEvolutionIcon } from './utils';

interface RankingTableProps {
  players: PlayerWithHistory[];
}

export function RankingTable({ players }: RankingTableProps) {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedPlayers = () => {
    return [...players].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'rank':
          aValue = a.rank;
          bValue = b.rank;
          break;
        case 'pseudo':
          aValue = a.pseudo.toLowerCase();
          bValue = b.pseudo.toLowerCase();
          break;
        case 'eloPoints':
          aValue = a.eloPoints;
          bValue = b.eloPoints;
          break;
        case 'winRate':
          const aWinRate = a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0;
          const bWinRate = b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0;
          aValue = aWinRate;
          bValue = bWinRate;
          break;
        default:
          aValue = a.rank;
          bValue = b.rank;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Débutant': 'bg-blue-100 text-blue-800',
      'Intermédiaire': 'bg-green-100 text-green-800', 
      'Avancé': 'bg-orange-100 text-orange-800',
      'Expert': 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const sortedPlayers = getSortedPlayers();

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">
              <Button variant="ghost" onClick={() => handleSort('rank')} className="h-8 p-0">
                Rang {getSortIcon('rank')}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('pseudo')} className="h-8 p-0">
                Joueur {getSortIcon('pseudo')}
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => handleSort('eloPoints')} className="h-8 p-0">
                Points ELO {getSortIcon('eloPoints')}
              </Button>
            </TableHead>
            <TableHead className="text-center">Évolution</TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => handleSort('winRate')} className="h-8 p-0">
                Ratio V/D {getSortIcon('winRate')}
              </Button>
            </TableHead>
            <TableHead className="text-center">Catégorie</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPlayers.map((player) => (
            <TableRow key={player.id} className="hover:bg-muted/50">
              <TableCell>
                <span className="text-lg">{player.rank}</span>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={player.avatar} alt={player.pseudo} />
                    <AvatarFallback>{player.pseudo.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{player.pseudo}</div>
                    <div className="text-sm text-muted-foreground">{player.gender}</div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell className="text-center">
                <span className="font-medium">{player.eloPoints}</span>
              </TableCell>
              
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  {getEvolutionIcon(player.evolution)}
                  <span className={`text-sm ${
                    player.evolution > 0 ? 'text-green-600' : 
                    player.evolution < 0 ? 'text-red-600' : 
                    'text-muted-foreground'
                  }`}>
                    {player.evolution > 0 ? '+' : ''}{player.evolution}
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium">{getWinRate(player.wins, player.losses)}%</span>
                  <span className="text-xs text-muted-foreground">
                    {player.wins}V - {player.losses}D
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="text-center">
                <Badge className={getCategoryColor(player.category)}>
                  {player.category}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}