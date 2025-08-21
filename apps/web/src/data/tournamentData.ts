import { Tournament } from '../types/tournament';

export const mockTournaments: Tournament[] = [
  {
    id: '1',
    title: 'Open de Paris',
    description: 'Tournoi amical pour tous les niveaux',
    image: '/images/paris.jpg',
    type: 'doubles',
    level: 'intermédiaire',
    status: 'registration',
    startDate: '2025-06-01',
    endDate: '2025-06-02',
    registrationDeadline: '2025-05-25',
    location: { name: 'Club de Paris', address: '123 Rue de Paris', lat: 48.8566, lng: 2.3522 },
    organizer: { name: 'Padel Paris', contact: 'contact@padelparis.fr' },
    currentParticipants: 8,
    maxParticipants: 16,
    entryFee: 20,
    prizes: { first: '200€', second: '100€', third: '50€' }
  },
  {
    id: '2',
    title: 'Tournoi des Pyrénées',
    description: 'Compétition en altitude',
    image: '/images/pyrenees.jpg',
    type: 'mixed',
    level: 'avancé',
    status: 'upcoming',
    startDate: '2025-07-10',
    endDate: '2025-07-12',
    registrationDeadline: '2025-07-01',
    location: { name: 'Club des Montagnes', address: '456 Avenue des Neiges', lat: 42.7, lng: 0.3 },
    organizer: { name: 'Pyrenees Padel', contact: 'info@pyreneespadel.fr' },
    currentParticipants: 12,
    maxParticipants: 24,
    entryFee: 30,
    prizes: { first: '500€', second: '250€', third: '100€' }
  }
];

export const sampleBracket = {
  rounds: [
    {
      name: 'Quart de finale',
      matches: [
        { teams: ['Équipe A', 'Équipe B'] as [string, string], score: [6, 4] as [number, number] },
        { teams: ['Équipe C', 'Équipe D'] as [string, string], score: [3, 6] as [number, number] }
      ]
    }
  ]
};
