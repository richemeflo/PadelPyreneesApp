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
import { fetchPlayer, updatePlayer, updatePlayerAddress } from "../../lib/api";

type PlayerResponse = Awaited<ReturnType<typeof fetchPlayer>>;

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [playerId, setPlayerId] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [locale, setLocale] = useState(i18n.language ?? "fr");
  const [streetNumber, setStreetNumber] = useState("");
  const [streetName, setStreetName] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
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
    setStreetNumber(player.streetNumber ?? "");
    setStreetName(player.streetName ?? "");
    setCity(player.city ?? "");
    setPostalCode(player.postalCode ?? "");
    setCountry(player.country ?? "");
    setFormattedAddress(player.formattedAddress ?? "");
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

    const payload: { pseudo?: string; locale?: string } = {};
    const trimmedPseudo = pseudo.trim();
    if (trimmedPseudo) {
      payload.pseudo = trimmedPseudo;
    }
    if (locale) {
      payload.locale = locale;
    }

    const trimmedStreetNumber = streetNumber.trim();
    const trimmedStreetName = streetName.trim();
    const trimmedCity = city.trim();
    const trimmedPostalCode = postalCode.trim();
    const trimmedCountry = country.trim().toUpperCase();
    const hasAddressInput = [
      trimmedStreetNumber,
      trimmedStreetName,
      trimmedCity,
      trimmedPostalCode,
      trimmedCountry,
    ].some((value) => value !== "");
    const hasAddressChanges = player
      ? trimmedStreetNumber !== String(player.streetNumber ?? "").trim() ||
        trimmedStreetName !== String(player.streetName ?? "").trim() ||
        trimmedCity !== String(player.city ?? "").trim() ||
        trimmedPostalCode !== String(player.postalCode ?? "").trim() ||
        trimmedCountry !== String(player.country ?? "").trim().toUpperCase()
      : hasAddressInput;
    let addressPayload:
      | {
          streetNumber?: string;
          streetName: string;
          city: string;
          postalCode: string;
          country: string;
        }
      | undefined;

    if (hasAddressInput && hasAddressChanges) {
      if (!trimmedStreetName || !trimmedCity || !trimmedPostalCode || !trimmedCountry) {
        setError(t("profile.invalidAddress"));
        return;
      }

      addressPayload = {
        streetNumber: trimmedStreetNumber ? trimmedStreetNumber : undefined,
        streetName: trimmedStreetName,
        city: trimmedCity,
        postalCode: trimmedPostalCode,
        country: trimmedCountry,
      };
    }

    setIsSaving(true);
    try {
      const requests: Array<Promise<unknown>> = [];
      if (Object.keys(payload).length > 0) {
        requests.push(updatePlayer(playerId, payload));
      }
      if (addressPayload) {
        requests.push(
          updatePlayerAddress(addressPayload).then((response) => {
            setFormattedAddress(response.address.formattedAddress ?? "");
          }),
        );
      }

      if (requests.length > 0) {
        await Promise.all(requests);
      }
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
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t("profile.addressTitle")}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="streetNumber">{t("profile.fields.streetNumber")}</Label>
                    <Input
                      id="streetNumber"
                      value={streetNumber}
                      onChange={(event) => setStreetNumber(event.target.value)}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="streetName">{t("profile.fields.streetName")}</Label>
                    <Input
                      id="streetName"
                      value={streetName}
                      onChange={(event) => setStreetName(event.target.value)}
                      autoCapitalize="words"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{t("profile.fields.city")}</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      autoCapitalize="words"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">{t("profile.fields.postalCode")}</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(event) => setPostalCode(event.target.value)}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">{t("profile.fields.country")}</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                      maxLength={2}
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </div>
                  {formattedAddress ? (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="formattedAddress">{t("profile.fields.formattedAddress")}</Label>
                      <Input id="formattedAddress" value={formattedAddress} disabled />
                    </div>
                  ) : null}
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
