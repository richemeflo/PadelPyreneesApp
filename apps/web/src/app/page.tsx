"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";

interface Event {
  id: string;
  title: string;
  date: string;
}

interface Match {
  id: string;
  opponent: string;
  date: string;
  location: string;
}

interface UserTournament {
  id: string;
  title: string;
  date: string;
  location: string;
}

interface Mission {
  id: string;
  title: string;
  frequency: "quotidienne" | "hebdomadaire" | "mensuelle" | "saison";
}

const mockEvents: Event[] = [
  { id: "1", title: "Padel Night", date: "10/08/2024" },
  { id: "2", title: "Tournoi de l'été", date: "20/08/2024" },
  { id: "3", title: "Stage Jeunes", date: "25/08/2024" },
];

const upcomingMatches: Match[] = [
  { id: "m1", opponent: "Alice/Bob", date: "05/08/2024 18:00", location: "Toulouse" },
  { id: "m2", opponent: "Charlie/Dave", date: "07/08/2024 19:30", location: "Pau" },
];

const upcomingTournaments: UserTournament[] = [
  { id: "t1", title: "Open de Toulouse", date: "10/09/2024", location: "Toulouse" },
];

const pastMatchesToDeclare: Match[] = [
  { id: "m3", opponent: "Eve/Frank", date: "20/07/2024", location: "Tarbes" },
];

const missions: Mission[] = [
  { id: "mission1", title: "Gagner un match", frequency: "quotidienne" },
  { id: "mission2", title: "Jouer 3 matchs", frequency: "hebdomadaire" },
  { id: "mission3", title: "Inviter un ami", frequency: "mensuelle" },
  { id: "mission4", title: "Participer à un tournoi", frequency: "saison" },
];

export default function HomePage() {
  const [missionFilter, setMissionFilter] = useState<Mission["frequency"]>("quotidienne");

  const userStats = {
    elo: 1520,
    scheduledMatches: upcomingMatches.length,
    scheduledTournaments: upcomingTournaments.length,
    resultsToDeclare: pastMatchesToDeclare.length,
  };

  const filteredMissions = missions.filter((m) => m.frequency === missionFilter);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Section 1: Mes informations */}
      <section>
        <h2 className="mb-4">Mes informations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{userStats.elo}</p>
              <p className="text-sm text-muted-foreground">Elo</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{userStats.scheduledMatches}</p>
              <p className="text-sm text-muted-foreground">Matchs prévus</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{userStats.scheduledTournaments}</p>
              <p className="text-sm text-muted-foreground">Tournois prévus</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{userStats.resultsToDeclare}</p>
              <p className="text-sm text-muted-foreground">Résultats à déclarer</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 2: Événements Padel Pyrénées */}
      {mockEvents.length > 0 && (
        <section>
          <h2 className="mb-4">Événements Padel Pyrénées</h2>
          <Carousel className="w-full">
            <CarouselContent>
              {mockEvents.map((event) => (
                <CarouselItem key={event.id} className="md:basis-1/3">
                  <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>
      )}

      {/* Section 3: Partie(s) prévue(s) */}
      {upcomingMatches.length > 0 && (
        <section>
          <h2 className="mb-4">Partie(s) prévue(s)</h2>
          <div className="space-y-4">
            {upcomingMatches.map((match) => (
              <Card key={match.id}>
                <CardContent className="p-4">
                  <p className="font-semibold">{match.opponent}</p>
                  <p className="text-sm text-muted-foreground">
                    {match.date} - {match.location}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Section 4: Tournoi(s) prévu(s) */}
      {upcomingTournaments.length > 0 && (
        <section>
          <h2 className="mb-4">Tournoi(s) prévu(s)</h2>
          <div className="space-y-4">
            {upcomingTournaments.map((tournament) => (
              <Card key={tournament.id}>
                <CardContent className="p-4">
                  <p className="font-semibold">{tournament.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {tournament.date} - {tournament.location}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Section 5: Déclarer le(s) résultat(s) */}
      <section>
        <h2 className="mb-4">Déclarer le(s) résultat(s)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pastMatchesToDeclare.map((match) => (
            <Card key={match.id} className="cursor-pointer">
              <CardContent className="p-4">
                <p className="font-semibold">{match.opponent}</p>
                <p className="text-sm text-muted-foreground">{match.date}</p>
              </CardContent>
            </Card>
          ))}
          <Card className="flex items-center justify-center cursor-pointer">
            <CardContent className="p-6 flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 6: Missions */}
      <section>
        <h2 className="mb-4">Missions</h2>
        <div className="flex gap-2 mb-4">
          {(["quotidienne", "hebdomadaire", "mensuelle", "saison"] as const).map((freq) => (
            <Button
              key={freq}
              variant={missionFilter === freq ? "default" : "outline"}
              size="sm"
              onClick={() => setMissionFilter(freq)}
            >
              {freq.charAt(0).toUpperCase() + freq.slice(1)}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMissions.map((mission) => (
            <Card key={mission.id}>
              <CardContent className="p-4">
                <p className="font-semibold">{mission.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

