import { useState, useMemo } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { FilterPeriod } from '../../types/player';
import { useTranslation } from 'react-i18next';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGender: string;
  onGenderChange: (gender: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPeriod: FilterPeriod;
  onPeriodChange: (period: FilterPeriod) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function SearchAndFilters({
  searchQuery,
  onSearchChange,
  selectedGender,
  onGenderChange,
  selectedCategory,
  onCategoryChange,
  selectedPeriod,
  onPeriodChange,
  onClearFilters,
  hasActiveFilters
}: SearchAndFiltersProps) {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);

  const periods = useMemo(
    () => [
      { value: '7j' as FilterPeriod, label: t('ranking.periods.7j') },
      { value: '1m' as FilterPeriod, label: t('ranking.periods.1m') },
      { value: '3m' as FilterPeriod, label: t('ranking.periods.3m') },
      { value: '6m' as FilterPeriod, label: t('ranking.periods.6m') },
      { value: '1an' as FilterPeriod, label: t('ranking.periods.1y') },
    ],
    [t]
  );

  const genders = useMemo(
    () => [
      { value: 'all', label: t('ranking.filters.genderAll') },
      { value: 'Homme', label: t('ranking.filters.genderMale') },
      { value: 'Femme', label: t('ranking.filters.genderFemale') },
    ],
    [t]
  );

  const categories = useMemo(
    () => [
      { value: 'all', label: t('ranking.filters.categoryAll') },
      { value: 'Débutant', label: 'Débutant' },
      { value: 'Intermédiaire', label: 'Intermédiaire' },
      { value: 'Avancé', label: 'Avancé' },
      { value: 'Expert', label: 'Expert' },
    ],
    [t]
  );

  return (
    <div className="space-y-4 mb-6">
      {/* Barre de recherche */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('ranking.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="whitespace-nowrap"
        >
          <Filter className="h-4 w-4 mr-2" />
          {t('ranking.filters.toggle')}
        </Button>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex flex-col gap-2">
            <label className="text-sm">{t('ranking.filters.genderLabel')}</label>
            <Select value={selectedGender} onValueChange={onGenderChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {genders.map((gender) => (
                  <SelectItem key={gender.value} value={gender.value}>
                    {gender.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm">{t('ranking.filters.categoryLabel')}</label>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm">{t('ranking.filters.periodLabel')}</label>
            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-end">
              <Button variant="ghost" onClick={onClearFilters} className="h-10">
                <X className="h-4 w-4 mr-2" />
                {t('ranking.filters.clear')}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Filtres actifs */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedGender !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {genders.find((gender) => gender.value === selectedGender)?.label ?? selectedGender}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onGenderChange('all')}
              />
            </Badge>
          )}
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {categories.find((category) => category.value === selectedCategory)?.label ?? selectedCategory}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onCategoryChange('all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
