import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PadelPyrenees",
  description: "Site de padel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b">
          <nav className="container mx-auto flex flex-wrap items-center justify-between p-4">
            <Link href="/" className="font-bold text-lg">
              PadelPyrenees
            </Link>
            <ul className="flex flex-wrap gap-4 text-sm">
              <li>
                <Link href="/classement" className="hover:text-blue-600">
                  Classement
                </Link>
              </li>
              <li>
                <Link href="/matchmaking" className="hover:text-blue-600">
                  Matchmaking
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="hover:text-blue-600">
                  Réservations
                </Link>
              </li>
              <li>
                <Link href="/tournois" className="hover:text-blue-600">
                  Tournois
                </Link>
              </li>
            </ul>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
