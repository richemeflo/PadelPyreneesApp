import { PlayerWithHistory } from '../types/player';

export const mockPlayers: PlayerWithHistory[] = [
  {
    id: '1',
    pseudo: 'Maxime',
    avatar: '/avatars/maxime.png',
    gender: 'Homme',
    category: 'Intermédiaire',
    rank: 1,
    eloPoints: 1600,
    evolution: 50,
    wins: 30,
    losses: 10,
    history: [
      { date: '2024-01-01', elo: 1400 },
      { date: '2024-02-01', elo: 1450 },
      { date: '2024-03-01', elo: 1500 },
      { date: '2024-04-01', elo: 1550 },
      { date: '2024-05-01', elo: 1600 }
    ]
  },
  {
    id: '2',
    pseudo: 'Léa',
    avatar: '/avatars/lea.png',
    gender: 'Femme',
    category: 'Intermédiaire',
    rank: 2,
    eloPoints: 1580,
    evolution: 40,
    wins: 28,
    losses: 12
  },
  {
    id: '3',
    pseudo: 'Julien',
    avatar: '/avatars/julien.png',
    gender: 'Homme',
    category: 'Intermédiaire',
    rank: 3,
    eloPoints: 1550,
    evolution: 30,
    wins: 25,
    losses: 15
  },
  {
    id: '4',
    pseudo: 'Emma',
    avatar: '/avatars/emma.png',
    gender: 'Femme',
    category: 'Débutant',
    rank: 4,
    eloPoints: 1200,
    evolution: 25,
    wins: 10,
    losses: 5
  },
  {
    id: '5',
    pseudo: 'Lucas',
    avatar: '/avatars/lucas.png',
    gender: 'Homme',
    category: 'Avancé',
    rank: 5,
    eloPoints: 1700,
    evolution: 20,
    wins: 40,
    losses: 20
  },
  {
    id: '6',
    pseudo: 'Chloé',
    avatar: '/avatars/chloe.png',
    gender: 'Femme',
    category: 'Intermédiaire',
    rank: 6,
    eloPoints: 1500,
    evolution: 10,
    wins: 20,
    losses: 18
  },
  {
    id: '7',
    pseudo: 'Nicolas',
    avatar: '/avatars/nicolas.png',
    gender: 'Homme',
    category: 'Expert',
    rank: 7,
    eloPoints: 1800,
    evolution: -5,
    wins: 50,
    losses: 25
  },
  {
    id: '8',
    pseudo: 'Sophie',
    avatar: '/avatars/sophie.png',
    gender: 'Femme',
    category: 'Débutant',
    rank: 8,
    eloPoints: 1150,
    evolution: -10,
    wins: 8,
    losses: 12
  },
  {
    id: '9',
    pseudo: 'Antoine',
    avatar: '/avatars/antoine.png',
    gender: 'Homme',
    category: 'Intermédiaire',
    rank: 9,
    eloPoints: 1480,
    evolution: -20,
    wins: 18,
    losses: 22
  },
  {
    id: '10',
    pseudo: 'Marie',
    avatar: '/avatars/marie.png',
    gender: 'Femme',
    category: 'Avancé',
    rank: 10,
    eloPoints: 1650,
    evolution: -30,
    wins: 35,
    losses: 25
  }
];
