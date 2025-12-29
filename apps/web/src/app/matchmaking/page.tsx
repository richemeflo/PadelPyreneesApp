"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { getStoredPlayerId } from "../../lib/auth";
import { fetchMatchmakingProposals, fetchPlayer } from "../../lib/api";

type PlayerResponse = Awaited<ReturnType<typeof fetchPlayer>>;

export default function MatchmakingPage() {
  const { t, i18n } = useTranslation();
  const [playerId, setPlayerId] = useState("");
  const hasPlayerId = Boolean(playerId);

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
    enabled: hasPlayerId,
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

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language ?? "fr", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [i18n.language],
  );

  const handleRefresh = () => {
    if (hasPlayerId) {
      refetchPlayer();
    }
    if (primaryPairId) {
      refetchProposals();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("nav.matchmaking")}</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={!hasPlayerId}>
          {t("common.refresh")}
        </Button>
      </div>

      {!hasPlayerId ? (
        <p className="text-sm text-muted-foreground">
          Missing player id. Sign in to continue.
        </p>
      ) : playerError ? (
        <ErrorState message={t("common.error")} onRetry={refetchPlayer} />
      ) : isPlayerLoading ? (
        <LoadingState label={t("common.loading")} />
      ) : !primaryPairId ? (
        <p className="text-sm text-muted-foreground">No pair available for matchmaking.</p>
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
                  <span>{t("matchmaking.eloGap")}: --</span>
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
        <p className="text-sm text-muted-foreground">No proposals available yet.</p>
      )}
    </div>
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
          Retry
        </Button>
      )}
    </div>
  );
}
