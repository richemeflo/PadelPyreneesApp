"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { TopPlayersCards } from "../../components/RankingComponents/TopPlayersCards";
import { RankingTable } from "../../components/RankingComponents/RankingTable";
import { SearchAndFilters } from "../../components/RankingComponents/SearchAndFilters";
import { Card, CardContent } from "../../components/ui/card";
import { PlayerAvatar } from "../../components/PlayerAvatar";
import { Input } from "../../components/ui/input";
import { EloChart } from "../../components/RankingComponents/EloChart";
import { getWinRate, getEvolutionIcon } from "../../components/RankingComponents/utils";
import { getInitials } from "../../utils/player";
import { FilterPeriod, PlayerWithHistory } from "../../types/player";
import { fetchRanking } from "../../lib/api";

const demoPlayerId = process.env.NEXT_PUBLIC_DEMO_PLAYER_ID ?? "";

export default function RankingPage() {
  const { t } = useTranslation();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["ranking", { limit: 100 }],
    queryFn: () => fetchRanking({ limit: 100 }),
  });

  const players: PlayerWithHistory[] = useMemo(() => {
    if (!data?.players) return [];
    return data.players.map((player) => ({
      id: player.id,
      pseudo: player.pseudo,
      avatar: "",
      gender: t("ranking.filters.genderAll"),
      category: categoryFromElo(player.elo),
      rank: player.rank,
      eloPoints: player.elo,
      evolution: 0,
      wins: 0,
      losses: 0,
    }));
  }, [data?.players, t]);

  const currentUser = useMemo(() => {
    if (!players.length) return undefined;
    return players.find((player) => player.id === demoPlayerId) ?? players[0];
  }, [players]);

  const topPlayers = useMemo(() => players.slice(0, 3), [players]);

  const [mySearch, setMySearch] = useState("");
  const myRankPlayers = useMemo(() => {
    if (!currentUser) return [];
    return players.filter(
      (player) =>
        player.category === currentUser.category &&
        player.pseudo.toLowerCase().includes(mySearch.toLowerCase()),
    );
  }, [players, currentUser, mySearch]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>("7j");

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesGender = selectedGender === "all" || player.gender === selectedGender;
      const matchesCategory = selectedCategory === "all" || player.category === selectedCategory;
      const matchesSearch = player.pseudo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGender && matchesCategory && matchesSearch;
    });
  }, [players, selectedGender, selectedCategory, searchQuery]);

  const hasActiveFilters =
    searchQuery !== "" || selectedGender !== "all" || selectedCategory !== "all";

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedGender("all");
    setSelectedCategory("all");
  };

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{t("ranking.title")}</h1>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm text-blue-600 hover:underline"
        >
          {t("common.refresh")}
        </button>
      </div>

      {error ? (
        <p className="text-sm text-red-600">{t("common.error")}</p>
      ) : isLoading || !currentUser ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <>
          <TopPlayersCards players={topPlayers} />

          <section>
            <h2 className="mb-4">{t("ranking.mine")}</h2>
            <Card>
              <CardContent className="p-6">
                <div className="mb-6 flex items-center gap-4">
                  <PlayerAvatar
                    src={currentUser.avatar}
                    alt={currentUser.pseudo}
                    name={currentUser.pseudo || getInitials(currentUser.pseudo)}
                    className="h-16 w-16"
                  />
                  <div>
                    <h3>{currentUser.pseudo}</h3>
                    <p className="text-sm text-muted-foreground">
                      #{currentUser.rank} • {currentUser.category}
                    </p>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 text-center md:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ELO</p>
                    <p className="text-2xl font-bold">{currentUser.eloPoints}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("ranking.title")}</p>
                    <div className="flex items-center justify-center gap-1">
                      {getEvolutionIcon(currentUser.evolution, true)}
                      <span className="text-sm text-muted-foreground">{currentUser.evolution}</span>
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

          <section>
            <h2 className="mb-4">{t("ranking.categoryHeading", { category: currentUser.category })}</h2>
            <div className="mb-4">
              <Input
                placeholder={t("ranking.searchPlaceholder") ?? ""}
                value={mySearch}
                onChange={(event) => setMySearch(event.target.value)}
              />
            </div>
            <RankingTable players={myRankPlayers} />
          </section>

          <section>
            <h2 className="mb-4">{t("ranking.general")}</h2>
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
        </>
      )}
    </div>
  );
}

function categoryFromElo(elo: number) {
  if (elo < 1100) return "Débutant";
  if (elo < 1400) return "Intermédiaire";
  if (elo < 1700) return "Avancé";
  return "Expert";
}
