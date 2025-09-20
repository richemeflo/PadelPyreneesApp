"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

export function HeaderNav() {
  const { t } = useTranslation();

  return (
    <header className="border-b">
      <nav className="container mx-auto flex flex-wrap items-center justify-between p-4">
        <Link href="/" className="font-bold text-lg">
          {t("appName")}
        </Link>
        <ul className="flex flex-wrap gap-4 text-sm">
          <li>
            <Link href="/" className="hover:text-blue-600">
              {t("nav.home")}
            </Link>
          </li>
          <li>
            <Link href="/classement" className="hover:text-blue-600">
              {t("nav.ranking")}
            </Link>
          </li>
          <li>
            <Link href="/matchmaking" className="hover:text-blue-600">
              {t("nav.matchmaking")}
            </Link>
          </li>
          <li>
            <Link href="/reservations" className="hover:text-blue-600">
              {t("nav.reservations")}
            </Link>
          </li>
          <li>
            <Link href="/tournois" className="hover:text-blue-600">
              {t("nav.tournaments")}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
