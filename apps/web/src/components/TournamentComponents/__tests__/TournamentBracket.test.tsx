import React from 'react';
jest.mock('../ui/card', () => ({}), { virtual: true });
import { TournamentBracket } from '../TournamentBracket';

describe('TournamentBracket', () => {
  it('is a valid component', () => {
    expect(typeof TournamentBracket).toBe('function');
  });
});
