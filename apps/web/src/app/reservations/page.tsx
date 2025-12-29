"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "../../components/ui/card";

export default function ReservationsPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("nav.reservations")}</h1>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          {t("nav.home")}
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Reservations feature is not wired yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
