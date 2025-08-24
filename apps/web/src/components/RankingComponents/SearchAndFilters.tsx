import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { FilterPeriod } from '../../types/player';

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
  const [showFilters, setShowFilters] = useState(false);

  const periods = [
    { value: '7j' as FilterPeriod, label: '7 jours' },
    { value: '1m' as FilterPeriod, label: '1 mois' },
    { value: '3m' as FilterPeriod, label: '3 mois' },
    { value: '6m' as FilterPeriod, label: '6 mois' },
    { value: '1an' as FilterPeriod, label: '1 an' }
  ];

  const genders = [
    { value: 'all', label: 'Tous' },
    { value: 'Homme', label: 'Hommes' },
    { value: 'Femme', label: 'Femmes' }
  ];

  const categories = [
    { value: 'all', label: 'Toutes' },
    { value: 'Débutant', label: 'Débutant' },
    { value: 'Intermédiaire', label: 'Intermédiaire' },
    { value: 'Avancé', label: 'Avancé' },
    { value: 'Expert', label: 'Expert' }
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Barre de recherche */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un joueur..."
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
          Filtres
        </Button>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex flex-col gap-2">
            <label className="text-sm">Sexe</label>
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
            <label className="text-sm">Catégorie</label>
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
            <label className="text-sm">Période</label>
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
                Effacer
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
              {selectedGender}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onGenderChange('all')}
              />
            </Badge>
          )}
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {selectedCategory}
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