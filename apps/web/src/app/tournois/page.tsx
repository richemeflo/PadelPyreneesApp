"use client";

import { useState, useMemo } from 'react';
import { Plus, Trophy, Calendar, Users, MapPin, Clock } from 'lucide-react';
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
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  
  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TournamentType>('all');
  const [selectedLevel, setSelectedLevel] = useState<TournamentLevel>('all');
  const [selectedStatus, setSelectedStatus] = useState<TournamentStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtres et tri des tournois
  const filteredAndSortedTournaments = useMemo(() => {
    let filtered = mockTournaments.filter(tournament => {
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
    toast.success(`Inscription au tournoi "${tournament.title}" confirmée !`);
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
            <p className="text-sm text-muted-foreground">Total tournois</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl">{stats.openRegistration}</p>
            <p className="text-sm text-muted-foreground">Inscriptions ouvertes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl">{stats.upcoming}</p>
            <p className="text-sm text-muted-foreground">À venir</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl">{stats.ongoing}</p>
            <p className="text-sm text-muted-foreground">En cours</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions principales */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="mb-2">🏆 Tous les Tournois</h2>
          <p className="text-muted-foreground">
            Découvrez et participez aux tournois de padel près de chez vous
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <MapPin className="h-4 w-4 mr-2" />
            Carte
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Organiser un tournoi
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
          ✅ Inscriptions ouvertes
        </Button>
        <Button 
          variant={selectedLevel === 'débutant' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedLevel(selectedLevel === 'débutant' ? 'all' : 'débutant')}
        >
          🟢 Débutants
        </Button>
        <Button 
          variant={selectedType === 'mixed' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedType(selectedType === 'mixed' ? 'all' : 'mixed')}
        >
          👫 Mixte
        </Button>
      </div>

      {/* Résultats */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredAndSortedTournaments.length} tournoi(s) trouvé(s)
        </p>
        
        {hasActiveFilters && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Filtres actifs
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
            <h3 className="mb-2">Aucun tournoi trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Aucun tournoi ne correspond à vos critères de recherche.
            </p>
            <Button variant="outline" onClick={handleClearFilters}>
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section promotion */}
      <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="mb-2">Organisez votre propre tournoi</h3>
          <p className="text-muted-foreground mb-6">
            Créez et gérez facilement vos tournois de padel avec nos outils dédiés
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer un tournoi
            </Button>
            <Button variant="outline">
              En savoir plus
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
