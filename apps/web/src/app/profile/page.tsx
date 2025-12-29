"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { getStoredPlayerId } from "../../lib/auth";
import { fetchPlayer, updatePlayer } from "../../lib/api";

type PlayerResponse = Awaited<ReturnType<typeof fetchPlayer>>;

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [playerId, setPlayerId] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [locale, setLocale] = useState(i18n.language ?? "fr");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storedPlayerId = getStoredPlayerId();
    setPlayerId(storedPlayerId ?? "");
  }, []);

  const { data: player, isLoading } = useQuery<PlayerResponse>({
    queryKey: ["player", playerId],
    queryFn: () => fetchPlayer(playerId),
    enabled: Boolean(playerId),
  });

  useEffect(() => {
    if (!player) return;
    setPseudo(player.pseudo ?? "");
    setEmail(player.email ?? "");
    setLocale(player.locale ?? i18n.language ?? "fr");
    setLat(player.lat !== null && player.lat !== undefined ? String(player.lat) : "");
    setLon(player.lon !== null && player.lon !== undefined ? String(player.lon) : "");
  }, [player, i18n.language]);

  const localeOptions = useMemo(
    () => [
      { value: "fr", label: t("profile.languages.fr") },
      { value: "en", label: t("profile.languages.en") },
    ],
    [t],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!playerId) {
      setError(t("profile.missingUser"));
      return;
    }

    const payload: { pseudo?: string; locale?: string; lat?: number; lon?: number } = {};
    const trimmedPseudo = pseudo.trim();
    if (trimmedPseudo) {
      payload.pseudo = trimmedPseudo;
    }
    if (locale) {
      payload.locale = locale;
    }

    if (lat.trim() !== "") {
      const parsedLat = Number.parseFloat(lat);
      if (Number.isNaN(parsedLat)) {
        setError(t("profile.invalidCoordinates"));
        return;
      }
      payload.lat = parsedLat;
    }

    if (lon.trim() !== "") {
      const parsedLon = Number.parseFloat(lon);
      if (Number.isNaN(parsedLon)) {
        setError(t("profile.invalidCoordinates"));
        return;
      }
      payload.lon = parsedLon;
    }

    setIsSaving(true);
    try {
      await updatePlayer(playerId, payload);
      await queryClient.invalidateQueries({ queryKey: ["player", playerId] });
      if (payload.locale && payload.locale !== i18n.language) {
        await i18n.changeLanguage(payload.locale);
      }
      setSuccess(t("profile.saveSuccess"));
    } catch {
      setError(t("profile.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("profile.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <Card>
          <CardContent className="p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t("profile.infoTitle")}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pseudo">{t("profile.fields.pseudo")}</Label>
                    <Input
                      id="pseudo"
                      value={pseudo}
                      onChange={(event) => setPseudo(event.target.value)}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("profile.fields.email")}</Label>
                    <Input id="email" value={email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lat">{t("profile.fields.lat")}</Label>
                    <Input
                      id="lat"
                      type="number"
                      value={lat}
                      onChange={(event) => setLat(event.target.value)}
                      inputMode="decimal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lon">{t("profile.fields.lon")}</Label>
                    <Input
                      id="lon"
                      type="number"
                      value={lon}
                      onChange={(event) => setLon(event.target.value)}
                      inputMode="decimal"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t("profile.settingsTitle")}</h2>
                <div className="space-y-2">
                  <Label htmlFor="locale">{t("profile.fields.locale")}</Label>
                  <Select value={locale} onValueChange={setLocale}>
                    <SelectTrigger id="locale">
                      <SelectValue placeholder={t("profile.localePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {localeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {success ? <p className="text-sm text-green-600">{success}</p> : null}

              <Button type="submit" disabled={isSaving}>
                {isSaving ? t("profile.saving") : t("profile.saveAction")}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
