import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const typeOptions = [
    { value: 'all', label: t('tournamentsPage.filters.types.all') },
    { value: 'singles', label: `🎯 ${t('tournamentsPage.types.singles')}` },
    { value: 'doubles', label: `🏓 ${t('tournamentsPage.types.doubles')}` },
    { value: 'mixed', label: `👥 ${t('tournamentsPage.types.mixed')}` }
  ];

  const levelOptions = [
    { value: 'all', label: t('tournamentsPage.filters.levels.all') },
    { value: 'débutant', label: `🏓 ${t('tournamentsPage.levels.beginner')}` },
    { value: 'intermédiaire', label: `🥉 ${t('tournamentsPage.levels.intermediate')}` },
    { value: 'avancé', label: `🥇 ${t('tournamentsPage.levels.advanced')}` },
    { value: 'expert', label: `💎 ${t('tournamentsPage.levels.expert')}` }
  ];

  const statusOptions = [
    { value: 'all', label: t('tournamentsPage.filters.statuses.all') },
    { value: 'registration', label: `✅ ${t('tournamentsPage.status.registration')}` },
    {
      value: 'upcoming',
      label: (
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" /> {t('tournamentsPage.status.upcoming')}
        </span>
      )
    },
    { value: 'ongoing', label: `⏳ ${t('tournamentsPage.status.ongoing')}` },
    { value: 'completed', label: `🏆 ${t('tournamentsPage.status.completed')}` }
  ];

  const sortOptions = [
    { value: 'date', label: t('tournamentsPage.filters.sort.date') },
    { value: 'title', label: t('tournamentsPage.filters.sort.title') },
    { value: 'level', label: t('tournamentsPage.filters.sort.level') },
    { value: 'participants', label: t('tournamentsPage.filters.sort.participants') }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('tournamentsPage.filters.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtres principaux */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm">{t('tournamentsPage.filters.typeLabel')}</label>
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
              <label className="text-sm">{t('tournamentsPage.filters.levelLabel')}</label>
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
              <label className="text-sm">{t('tournamentsPage.filters.statusLabel')}</label>
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
              <label className="text-sm">{t('tournamentsPage.filters.sortLabel')}:</label>
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
                {sortOrder === 'asc'
                  ? t('tournamentsPage.filters.sort.asc')
                  : t('tournamentsPage.filters.sort.desc')}
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
                {t('tournamentsPage.filters.clear')}
              </Button>
            )}
          </div>

          {/* Filtres actifs */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {selectedType !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {t('tournamentsPage.filters.activeType')}: {typeOptions.find(o => o.value === selectedType)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => onTypeChange('all')}
                  />
                </Badge>
              )}
              {selectedLevel !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {t('tournamentsPage.filters.activeLevel')}: {levelOptions.find(o => o.value === selectedLevel)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => onLevelChange('all')}
                  />
                </Badge>
              )}
              {selectedStatus !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {t('tournamentsPage.filters.activeStatus')}: {statusOptions.find(o => o.value === selectedStatus)?.label}
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
