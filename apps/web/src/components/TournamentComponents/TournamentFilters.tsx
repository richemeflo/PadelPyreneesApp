import { Search, X, ArrowUpDown, Clock } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { TournamentType, TournamentLevel, TournamentStatus, SortOption } from '../../types/tournament';

interface TournamentFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: TournamentType;
  onTypeChange: (type: TournamentType) => void;
  selectedLevel: TournamentLevel;
  onLevelChange: (level: TournamentLevel) => void;
  selectedStatus: TournamentStatus;
  onStatusChange: (status: TournamentStatus) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function TournamentFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedLevel,
  onLevelChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
  hasActiveFilters
}: TournamentFiltersProps) {
  const typeOptions = [
    { value: 'all', label: 'Tous les types' },
    { value: 'singles', label: '👤 Singles' },
    { value: 'doubles', label: '👥 Doubles' },
    { value: 'mixed', label: '👫 Mixte' }
  ];

  const levelOptions = [
    { value: 'all', label: 'Tous les niveaux' },
    { value: 'débutant', label: '🟢 Débutant' },
    { value: 'intermédiaire', label: '🔵 Intermédiaire' },
    { value: 'avancé', label: '🟠 Avancé' },
    { value: 'expert', label: '🔴 Expert' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'registration', label: '✅ Inscriptions ouvertes' },
    {
      value: 'upcoming',
      label: (
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" /> À venir
        </span>
      )
    },
    { value: 'ongoing', label: '⌛ En cours' },
    { value: 'completed', label: '🏆 Terminés' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'title', label: 'Titre' },
    { value: 'level', label: 'Niveau' },
    { value: 'participants', label: 'Participants' }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un tournoi par nom, lieu..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtres principaux */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Type de tournoi</label>
              <Select value={selectedType} onValueChange={onTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Niveau</label>
              <Select value={selectedLevel} onValueChange={onLevelChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Statut</label>
              <Select value={selectedStatus} onValueChange={onStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tri */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2 items-center">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm">Trier par:</label>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>

            {/* Effacer les filtres */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Effacer les filtres
              </Button>
            )}
          </div>

          {/* Filtres actifs */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {selectedType !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {typeOptions.find(o => o.value === selectedType)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => onTypeChange('all')}
                  />
                </Badge>
              )}
              {selectedLevel !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Niveau: {levelOptions.find(o => o.value === selectedLevel)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => onLevelChange('all')}
                  />
                </Badge>
              )}
              {selectedStatus !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Statut: {statusOptions.find(o => o.value === selectedStatus)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => onStatusChange('all')}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}