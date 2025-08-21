export type TournamentType = 'singles' | 'doubles' | 'mixed' | 'all';
export type TournamentLevel = 'débutant' | 'intermédiaire' | 'avancé' | 'expert' | 'all';
export type TournamentStatus = 'registration' | 'upcoming' | 'ongoing' | 'completed' | 'all';
export type SortOption = 'date' | 'title' | 'level' | 'participants';

export interface Tournament {
  id: string;
  title: string;
  description: string;
  image: string;
  type: TournamentType;
  level: TournamentLevel;
  status: TournamentStatus;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  location: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  organizer: {
    name: string;
    contact: string;
  };
  currentParticipants: number;
  maxParticipants: number;
  entryFee: number;
  prizes: {
    first: string;
    second: string;
    third: string;
  };
  results?: {
    winner: { name: string };
    runnerUp: { name: string };
    thirdPlace: { name: string }[];
  };
}
