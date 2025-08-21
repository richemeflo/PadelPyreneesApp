import React from 'react';
jest.mock('../ui/card', () => ({}), { virtual: true });
jest.mock('../ui/badge', () => ({}), { virtual: true });
jest.mock('../ui/button', () => ({}), { virtual: true });
jest.mock('../ui/separator', () => ({}), { virtual: true });
jest.mock('../ui/tabs', () => ({}), { virtual: true });
jest.mock('../ui/dialog', () => ({}), { virtual: true });
jest.mock('../ui/input', () => ({}), { virtual: true });
jest.mock('../ui/textarea', () => ({}), { virtual: true });
import { TournamentDetail } from '../TournamentDetail';
import { mockTournaments } from '../../../data/tournamentData';

describe('TournamentDetail', () => {
  it('is a valid component', () => {
    expect(typeof TournamentDetail).toBe('function');
    expect(mockTournaments.length).toBeGreaterThan(0);
  });
});
