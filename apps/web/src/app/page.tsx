"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { getStoredPlayerId } from "../lib/auth";
import { fetchMatchmakingProposals, fetchPlayer, fetchTournaments } from "../lib/api";

type PlayerResponse = Awaited<ReturnType<typeof fetchPlayer>>;

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [playerId, setPlayerId] = useState("");

  useEffect(() => {
    const storedPlayerId = getStoredPlayerId();
    const fallbackPlayerId = process.env.NEXT_PUBLIC_DEMO_PLAYER_ID ?? "";
    setPlayerId(storedPlayerId ?? fallbackPlayerId);
  }, []);

  const {
    data: player,
    isLoading: isPlayerLoading,
    error: playerError,
    refetch: refetchPlayer,
  } = useQuery<PlayerResponse>({
    queryKey: ["player", playerId],
    queryFn: () => fetchPlayer(playerId),
    enabled: Boolean(playerId),
  });

  const primaryPairId = useMemo(() => {
    if (!player) return undefined;
    if (player.pairsAsA.length > 0) return player.pairsAsA[0].id;
    if (player.pairsAsB.length > 0) return player.pairsAsB[0].id;
    return undefined;
  }, [player]);

  const {
    data: proposals,
    isLoading: isProposalsLoading,
    error: proposalsError,
    refetch: refetchProposals,
  } = useQuery({
    queryKey: ["matchmaking", primaryPairId],
    queryFn: () => fetchMatchmakingProposals(primaryPairId as string),
    enabled: Boolean(primaryPairId),
  });

  const {
    data: tournaments,
    isLoading: isTournamentsLoading,
    error: tournamentsError,
    refetch: refetchTournaments,
  } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => fetchTournaments(6),
  });

  const stats = {
    elo: player?.elo ?? "--",
    scheduledMatches: proposals?.length ?? 0,
    scheduledTournaments: tournaments?.length ?? 0,
    resultsToDeclare: 0,
  };

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language ?? "fr", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [i18n.language],
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <section>
        <h2 className="mb-4 text-xl font-semibold">{t("home.info")}</h2>
        {!playerId ? (
          <p className="text-sm text-muted-foreground">Missing player id. Sign in to continue.</p>
        ) : playerError ? (
          <ErrorState message={t("common.error")} onRetry={refetchPlayer} />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label={t("stats.elo")} value={stats.elo} loading={isPlayerLoading} />
            <StatCard
              label={t("stats.scheduledMatches")}
              value={stats.scheduledMatches}
              loading={isProposalsLoading}
            />
            <StatCard
              label={t("stats.scheduledTournaments")}
              value={stats.scheduledTournaments}
              loading={isTournamentsLoading}
            />
            <StatCard
              label={t("stats.resultsToDeclare")}
              value={stats.resultsToDeclare}
              loading={false}
            />
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t("tournaments.upcoming")}</h2>
          <Button variant="outline" size="sm" onClick={() => refetchTournaments()}>
            {t("common.refresh")}
          </Button>
        </div>
        {tournamentsError ? (
          <ErrorState message={t("common.error")} onRetry={refetchTournaments} />
        ) : isTournamentsLoading ? (
          <LoadingState label={t("common.loading")} />
        ) : tournaments && tournaments.length > 0 ? (
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <Card key={tournament.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{tournament.name}</p>
                      {tournament.place && (
                        <p className="text-sm text-muted-foreground">{tournament.place}</p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(tournament.startsAt).toLocaleDateString(i18n.language ?? "fr", {
                        dateStyle: "medium",
                      })}
                    </div>
                  </div>
                  {tournament.desc && (
                    <p className="mt-2 text-sm text-muted-foreground">{tournament.desc}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      {t("tournaments.register")}: {tournament.participantCount ?? 0}
                    </span>
                    {tournament.isRegistered && <span>• {t("tournaments.alreadyRegistered")}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t("matchmaking.proposals")}</h2>
          <Button variant="outline" size="sm" onClick={() => refetchProposals()} disabled={!primaryPairId}>
            {t("common.refresh")}
          </Button>
        </div>
        {!primaryPairId ? (
          <p className="text-sm text-muted-foreground">
            {t("common.error")}
          </p>
        ) : proposalsError ? (
          <ErrorState message={t("common.error")} onRetry={refetchProposals} />
        ) : isProposalsLoading ? (
          <LoadingState label={t("common.loading")} />
        ) : proposals && proposals.length > 0 ? (
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <Card key={proposal.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex flex-wrap justify-between text-sm text-muted-foreground">
                    <span>
                      {t("matchmaking.schedule")}: {dateFormatter.format(new Date(proposal.start))}
                    </span>
                    <span>
                      {t("matchmaking.distance")}: ~
                      {proposal.location.lat.toFixed(2)}, {proposal.location.lon.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-between text-sm text-muted-foreground">
                    <span>
                      {t("matchmaking.eloGap")}: --
                    </span>
                    <span>
                      {proposal.acceptedPairIds.length >= 2
                        ? t("matchmaking.accepted")
                        : t("matchmaking.accept")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: string | number;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold">{loading ? "--" : value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function LoadingState({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground">{label}</p>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-2 text-sm text-red-600">
      <span>{message}</span>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          ↻
        </Button>
      )}
    </div>
  );
}
