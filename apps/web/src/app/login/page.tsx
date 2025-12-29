"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { setStoredAuth } from "../../lib/auth";
import { signInUser } from "../../lib/api";
import { getAuthErrorMessage } from "../../lib/authErrors";

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();

    if (!trimmedIdentifier || !trimmedPassword) {
      setError(t("auth.errors.missingFields"));
      return;
    }

    try {
      const response = await signInUser({
        identifier: trimmedIdentifier,
        password: trimmedPassword,
      });
      setStoredAuth({ playerId: response.player.id, idToken: response.token });
    } catch (error) {
      setError(getAuthErrorMessage(error, t, "login"));
      return;
    }

    router.replace("/");
  };

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">{t("auth.signInTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("auth.signInSubtitle")}</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="identifier">{t("auth.identifierLabel")}</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.passwordLabel")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                  title={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" className="w-full">
              {t("auth.signInAction")}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              {t("auth.registerLink")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
