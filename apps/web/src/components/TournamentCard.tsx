import Image from "next/image";

export interface Tournament {
  id: number;
  title: string;
  image: string;
  type: string;
  status: string;
  date: string;
  level: string;
  participants: string;
  price: string;
  reward: string;
}

export default function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <div className="relative">
        <Image
          src={tournament.image}
          alt={tournament.title}
          width={600}
          height={160}
          className="w-full h-40 object-cover"
        />
        <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
          {tournament.status}
        </span>
        <span className="absolute top-2 right-2 bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded">
          {tournament.type}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-4 flex-grow">
        <h3 className="font-semibold text-lg">{tournament.title}</h3>
        <p className="text-sm text-gray-600">{tournament.participants}</p>
        <p className="text-sm text-gray-600">{tournament.level}</p>
        <p className="text-sm text-gray-600">{tournament.date}</p>
        <div className="mt-auto">
          <div className="flex justify-between items-center text-sm text-gray-700 mb-4">
            <span>{tournament.price}</span>
            <span>{tournament.reward}</span>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-2 rounded">
              Détails
            </button>
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded">
              S&apos;inscrire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
