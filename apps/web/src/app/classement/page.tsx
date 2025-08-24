"use client";

import { useState, useMemo } from 'react';
import { TopPlayersCards } from '../../components/RankingComponents/TopPlayersCards';
import { RankingTable } from '../../components/RankingComponents/RankingTable';
import { SearchAndFilters } from '../../components/RankingComponents/SearchAndFilters';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { PlayerWithHistory, FilterPeriod } from '../../types/player';
import { mockPlayers } from '../../data/playerData';
import { EloChart } from '../../components/RankingComponents/EloChart';
import { getWinRate, getEvolutionIcon } from '../../components/RankingComponents/utils';
import { getInitials } from '../../utils/player';

export default function RankingPage() {
  const currentUser: PlayerWithHistory = mockPlayers[0];

  const topPlayers = useMemo(() => {
    return [...mockPlayers].sort((a, b) => b.evolution - a.evolution);
  }, []);

  const [mySearch, setMySearch] = useState('');
  const myRankPlayers = useMemo(() => {
    return mockPlayers.filter(
      (p) =>
        p.category === currentUser.category &&
        p.pseudo.toLowerCase().includes(mySearch.toLowerCase())
    );
  }, [mySearch, currentUser.category]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>('7j');

  const filteredPlayers = useMemo(() => {
    return mockPlayers.filter((p) => {
      const matchesGender = selectedGender === 'all' || p.gender === selectedGender;
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch = p.pseudo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGender && matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedGender, selectedCategory]);

  const hasActiveFilters =
    searchQuery !== '' || selectedGender !== 'all' || selectedCategory !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGender('all');
    setSelectedCategory('all');
  };

  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-bold mb-4">Classement</h1>

      {/* Top 3 progression */}
      <TopPlayersCards players={topPlayers} />

      {/* User ranking */}
      <section>
        <h2 className="mb-4">Mon classement</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={currentUser.avatar} alt={currentUser.pseudo} />
                <AvatarFallback>{getInitials(currentUser.pseudo)}</AvatarFallback>
              </Avatar>
              <div>
                <h3>{currentUser.pseudo}</h3>
                <p className="text-sm text-muted-foreground">
                  #{currentUser.rank} • {currentUser.category}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground">ELO</p>
                <p className="text-2xl font-bold">{currentUser.eloPoints}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Évolution</p>
                <div className="flex items-center justify-center gap-1">
                  {getEvolutionIcon(currentUser.evolution, true)}
                  <span
                    className={`${
                      currentUser.evolution > 0
                        ? 'text-green-600'
                        : currentUser.evolution < 0
                        ? 'text-red-600'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {currentUser.evolution > 0 ? '+' : ''}
                    {currentUser.evolution}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ratio</p>
                <p className="text-2xl font-bold">
                  {getWinRate(currentUser.wins, currentUser.losses)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentUser.wins}V - {currentUser.losses}D
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rang</p>
                <p className="text-2xl font-bold">#{currentUser.rank}</p>
              </div>
            </div>

            {currentUser.history && <EloChart history={currentUser.history} />}
          </CardContent>
        </Card>
      </section>

      {/* Ranking by user's category */}
      <section>
        <h2 className="mb-4">Classement {currentUser.category}</h2>
        <div className="mb-4">
          <Input
            placeholder="Rechercher un joueur..."
            value={mySearch}
            onChange={(e) => setMySearch(e.target.value)}
          />
        </div>
        <RankingTable players={myRankPlayers} />
      </section>

      {/* General ranking */}
      <section>
        <h2 className="mb-4">Classement général</h2>
        <SearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedGender={selectedGender}
          onGenderChange={setSelectedGender}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
        <RankingTable players={filteredPlayers} />
      </section>
    </div>
  );
}
