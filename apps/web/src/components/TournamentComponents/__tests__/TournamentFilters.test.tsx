import React from 'react';
jest.mock('../ui/input', () => ({}), { virtual: true });
jest.mock('../ui/button', () => ({}), { virtual: true });
jest.mock('../ui/badge', () => ({}), { virtual: true });
jest.mock('../ui/select', () => ({}), { virtual: true });
jest.mock('../ui/card', () => ({}), { virtual: true });
import { TournamentFilters } from '../TournamentFilters';

describe('TournamentFilters', () => {
  it('is a valid component', () => {
    expect(typeof TournamentFilters).toBe('function');
  });
});
