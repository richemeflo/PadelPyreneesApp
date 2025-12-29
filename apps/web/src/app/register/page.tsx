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
import { registerUser } from "../../lib/api";
import { getAuthErrorMessage } from "../../lib/authErrors";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const trimmedPseudo = pseudo.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedPseudo || !trimmedEmail || !trimmedPassword) {
      setError(t("auth.errors.missingFields"));
      return;
    }

    try {
      const response = await registerUser({
        pseudo: trimmedPseudo,
        email: trimmedEmail,
        password: trimmedPassword,
      });
      setStoredAuth({ playerId: response.player.id, idToken: response.token });
      router.replace("/");
    } catch (error) {
      setError(getAuthErrorMessage(error, t, "register"));
    }
  };

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">{t("auth.registerTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("auth.registerSubtitle")}</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="pseudo">{t("auth.usernameLabel")}</Label>
              <Input
                id="pseudo"
                value={pseudo}
                onChange={(event) => setPseudo(event.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="email"
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
                  autoComplete="new-password"
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
              {t("auth.registerAction")}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            {t("auth.haveAccount")}{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              {t("auth.signInLink")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
