"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Button } from "../ui/button";
import { clearStoredAuth, getStoredAuth } from "../../lib/auth";
import { logoutUser } from "../../lib/api";

export function HeaderNav() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = Boolean(getStoredAuth());

  const navItems = [
    { href: "/", label: t("nav.home"), requiresAuth: true },
    { href: "/classement", label: t("nav.ranking"), requiresAuth: true },
    { href: "/matchmaking", label: t("nav.matchmaking"), requiresAuth: true },
    { href: "/reservations", label: t("nav.reservations"), requiresAuth: true },
    { href: "/tournois", label: t("nav.tournaments"), requiresAuth: true },
  ];

  const authItems = [
    { href: "/login", label: t("nav.login") },
    { href: "/register", label: t("nav.register") },
  ];

  const visibleItems = navItems.filter((item) => isAuthenticated || !item.requiresAuth);
  const showAuthItems = !isAuthenticated;
  const showActions = visibleItems.length > 0 || showAuthItems || isAuthenticated;

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } finally {
      clearStoredAuth();
      router.replace("/login");
    }
  };

  return (
    <header className="border-b">
      <nav className="container mx-auto flex flex-wrap items-center justify-between p-4">
        <Link href="/" className="font-bold text-lg">
          {t("appName")}
        </Link>
        {showActions ? (
          <ul className="flex flex-wrap gap-4 text-sm">
            {visibleItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-blue-600">
                  {item.label}
                </Link>
              </li>
            ))}
            {showAuthItems
              ? authItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-blue-600">
                      {item.label}
                    </Link>
                  </li>
                ))
              : null}
            {isAuthenticated ? (
              <li>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  {t("nav.signOut")}
                </Button>
              </li>
            ) : null}
          </ul>
        ) : null}
      </nav>
    </header>
  );
}
