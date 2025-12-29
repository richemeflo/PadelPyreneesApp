"use client";

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trophy, Calendar, Hourglass, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { TournamentCard } from '../../components/TournamentComponents/TournamentCard';
import { TournamentFilters } from '../../components/TournamentComponents/TournamentFilters';
import { TournamentDetail } from '../../components/TournamentComponents/TournamentDetail';
import { mockTournaments } from '../../data/tournamentData';
import { Tournament, TournamentType, TournamentLevel, TournamentStatus, SortOption } from '../../types/tournament';

export default function TournamentPage() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [registeredTournamentIds, setRegisteredTournamentIds] = useState<Set<string>>(new Set());
  const [myFilter, setMyFilter] = useState<'upcoming' | 'completed'>('upcoming');

  const myTournaments = useMemo(() => {
    return mockTournaments.filter(t => registeredTournamentIds.has(t.id));
  }, [registeredTournamentIds]);

  const myFilteredTournaments = useMemo(() => {
    return myTournaments.filter(t =>
      myFilter === 'upcoming' ? t.status !== 'completed' : t.status === 'completed'
    );
  }, [myFilter, myTournaments]);
  
  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TournamentType>('all');
  const [selectedLevel, setSelectedLevel] = useState<TournamentLevel>('all');
  const [selectedStatus, setSelectedStatus] = useState<TournamentStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtres et tri des tournois
  const filteredAndSortedTournaments = useMemo(() => {
    const filtered = mockTournaments.filter(tournament => {
      // Filtre par recherche
      const matchesSearch = 
        tournament.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.location.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtre par type
      const matchesType = selectedType === 'all' || tournament.type === selectedType;
      
      // Filtre par niveau
      const matchesLevel = selectedLevel === 'all' || tournament.level === selectedLevel;
      
      // Filtre par statut
      const matchesStatus = selectedStatus === 'all' || tournament.status === selectedStatus;
      
      return matchesSearch && matchesType && matchesLevel && matchesStatus;
    });

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'level':
          const levelOrder = { 'débutant': 1, 'intermédiaire': 2, 'avancé': 3, 'expert': 4 };
          comparison = levelOrder[a.level] - levelOrder[b.level];
          break;
        case 'participants':
          comparison = a.currentParticipants - b.currentParticipants;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [searchQuery, selectedType, selectedLevel, selectedStatus, sortBy, sortOrder]);

  const hasActiveFilters = 
    searchQuery !== '' || 
    selectedType !== 'all' || 
    selectedLevel !== 'all' || 
    selectedStatus !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedLevel('all');
    setSelectedStatus('all');
  };

  const handleViewDetails = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedTournament(null);
  };

  const handleRegister = (tournament: Tournament) => {
    // Simulation d'inscription
    toast.success(t('tournamentsPage.toast.registered', { title: tournament.title }));
    setRegisteredTournamentIds(prev => {
      const newSet = new Set(prev);
      newSet.add(tournament.id);
      return newSet;
    });
  };

  // Statistiques rapides
  const stats = {
    total: mockTournaments.length,
    openRegistration: mockTournaments.filter(t => t.status === 'registration').length,
    upcoming: mockTournaments.filter(t => t.status === 'upcoming').length,
    ongoing: mockTournaments.filter(t => t.status === 'ongoing').length
  };

  if (currentView === 'detail' && selectedTournament) {
    return (
      <div className="container mx-auto px-4 py-8">
        <TournamentDetail 
          tournament={selectedTournament}
          onBack={handleBackToList}
          onRegister={handleRegister}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl">{stats.total}</p>
            <p className="text-sm text-muted-foreground">{t('tournamentsPage.stats.total')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl">{stats.openRegistration}</p>
            <p className="text-sm text-muted-foreground">{t('tournamentsPage.stats.openRegistration')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl">{stats.upcoming}</p>
            <p className="text-sm text-muted-foreground">{t('tournamentsPage.stats.upcoming')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Hourglass className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl">{stats.ongoing}</p>
            <p className="text-sm text-muted-foreground">{t('tournamentsPage.stats.ongoing')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Mes Tournois */}
      <div>
        <h2 className="mb-4">🎾 {t('tournamentsPage.myTournaments.title')}</h2>
        <div className="flex gap-2 mb-4">
          <Button
            variant={myFilter === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setMyFilter('upcoming')}
          >
            <Clock className="mr-2 h-4 w-4" /> {t('tournamentsPage.myTournaments.upcoming')}
          </Button>
          <Button
            variant={myFilter === 'completed' ? 'default' : 'outline'}
            onClick={() => setMyFilter('completed')}
          >
            🏁 {t('tournamentsPage.myTournaments.completed')}
          </Button>
        </div>

        {myFilteredTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {myFilteredTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onViewDetails={handleViewDetails}
                onRegister={handleRegister}
              />
            ))}
          </div>
        ) : (
          <Card className="mb-8">
            <CardContent className="p-12 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="mb-2">
                {myFilter === 'upcoming'
                  ? t('tournamentsPage.myTournaments.emptyUpcoming')
                  : t('tournamentsPage.myTournaments.emptyCompleted')}
              </h3>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions principales */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="mb-2">🏆 {t('tournamentsPage.allTournaments.title')}</h2>
          <p className="text-muted-foreground">
            {t('tournamentsPage.allTournaments.subtitle')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <MapPin className="h-4 w-4 mr-2" />
            {t('tournamentsPage.actions.map')}
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('tournamentsPage.actions.organize')}
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <TournamentFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Badges de filtres rapides */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={selectedStatus === 'registration' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedStatus(selectedStatus === 'registration' ? 'all' : 'registration')}
        >
          ✅ {t('tournamentsPage.status.registration')}
        </Button>
        <Button 
          variant={selectedLevel === 'débutant' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedLevel(selectedLevel === 'débutant' ? 'all' : 'débutant')}
        >
          🏓 {t('tournamentsPage.quickFilters.beginner')}
        </Button>
        <Button 
          variant={selectedType === 'mixed' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedType(selectedType === 'mixed' ? 'all' : 'mixed')}
        >
          👥 {t('tournamentsPage.types.mixed')}
        </Button>
      </div>

      {/* Résultats */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {t('tournamentsPage.resultsCount', { count: filteredAndSortedTournaments.length })}
        </p>
        
        {hasActiveFilters && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {t('tournamentsPage.filters.activeBadge')}
          </Badge>
        )}
      </div>

      {/* Grille des tournois */}
      {filteredAndSortedTournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onViewDetails={handleViewDetails}
              onRegister={handleRegister}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="mb-2">{t('tournamentsPage.noResultsTitle')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('tournamentsPage.noResultsSubtitle')}
            </p>
            <Button variant="outline" onClick={handleClearFilters}>
              {t('tournamentsPage.actions.resetFilters')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section promotion */}
      <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="mb-2">{t('tournamentsPage.promotion.title')}</h3>
          <p className="text-muted-foreground mb-6">
            {t('tournamentsPage.promotion.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('tournamentsPage.actions.create')}
            </Button>
            <Button variant="outline">
              {t('tournamentsPage.actions.learnMore')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
