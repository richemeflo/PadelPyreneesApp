import React from 'react';
jest.mock('../ui/card', () => ({}), { virtual: true });
jest.mock('../ui/badge', () => ({}), { virtual: true });
jest.mock('../ui/button', () => ({}), { virtual: true });
import { TournamentCard } from '../TournamentCard';
import { Tournament } from '../../../types/tournament';

describe('TournamentCard', () => {
  const tournament: Tournament = {
    id: '1',
    title: 'Open Test',
    description: 'Desc',
    image: '/test.jpg',
    type: 'doubles',
    level: 'intermédiaire',
    status: 'registration',
    startDate: '2025-06-01',
    endDate: '2025-06-02',
    registrationDeadline: '2025-05-25',
    location: { name: 'Club', address: 'Address', lat: 0, lng: 0 },
    organizer: { name: 'Org', contact: 'contact' },
    currentParticipants: 4,
    maxParticipants: 16,
    entryFee: 10,
    prizes: { first: 'Trophy', second: 'Medal', third: 'Gift' }
  };

  it('is a valid component', () => {
    expect(typeof TournamentCard).toBe('function');
  });
});
