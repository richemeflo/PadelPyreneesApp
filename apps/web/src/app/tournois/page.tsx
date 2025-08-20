import TournamentCard, { Tournament } from "@/components/TournamentCard";

const tournaments: Tournament[] = [
  {
    id: 1,
    title: "Tournoi Mixte Halloween",
    image: "https://images.unsplash.com/photo-1603279091656-1433c0af5004?auto=format&fit=crop&w=800&q=60",
    type: "Mixte",
    status: "Inscription ouverte",
    date: "24 oct. - 27 oct. 2024",
    level: "Niveau 3",
    participants: "32 participants",
    price: "20€ / joueur",
    reward: "500€ + Trophée",
  },
  {
    id: 2,
    title: "Championnat d'Automne",
    image: "https://images.unsplash.com/photo-1598974578018-9d1d7d6f928d?auto=format&fit=crop&w=800&q=60",
    type: "Individuel",
    status: "Inscription ouverte",
    date: "12 nov. - 15 nov. 2024",
    level: "Niveau 4",
    participants: "24 participants",
    price: "30€ / joueur",
    reward: "300€ + Trophée",
  },
  {
    id: 3,
    title: "Open des Débutants",
    image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=800&q=60",
    type: "Débutant",
    status: "Complet",
    date: "29 nov. - 3 déc. 2024",
    level: "Niveau 1",
    participants: "16 participants",
    price: "10€ / joueur",
    reward: "Lots",
  },
  {
    id: 4,
    title: "Corporate Challenge",
    image: "https://images.unsplash.com/photo-1508606572321-901ea4437071?auto=format&fit=crop&w=800&q=60",
    type: "Entreprise",
    status: "Inscription ouverte",
    date: "25 nov. 2024",
    level: "Tous niveaux",
    participants: "40 participants",
    price: "Gratuit",
    reward: "Trophée",
  },
];

export default function TournoisPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Tournois</h1>
      <p className="text-gray-600 mb-6">
        Participez aux tournois et compétitions de padel
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 border rounded-lg">
          <p className="text-2xl font-bold">6</p>
          <p className="text-sm text-gray-600">Tournois</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <p className="text-2xl font-bold">2</p>
          <p className="text-sm text-gray-600">Inscription ouverte</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <p className="text-2xl font-bold">1</p>
          <p className="text-sm text-gray-600">En cours</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 rounded-full border text-sm">
            Inscriptions ouvertes
          </button>
          <button className="px-3 py-1 rounded-full border text-sm">
            Inscriptions fermées
          </button>
          <button className="px-3 py-1 rounded-full border text-sm">Niveau</button>
          <button className="px-3 py-1 rounded-full border text-sm">Date</button>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-full border text-sm">Carte</button>
          <button className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm">
            Organiser un tournoi
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((t) => (
          <TournamentCard key={t.id} tournament={t} />
        ))}
      </div>
    </main>
  );
}

