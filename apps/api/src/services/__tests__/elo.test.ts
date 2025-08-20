import { expectedScore, updateElo } from '../elo';

describe('expectedScore', () => {
  it('returns 0.5 for equal ratings', () => {
    expect(expectedScore(1000, 1000)).toBeCloseTo(0.5, 5);
  });

  it('returns higher probability for higher rated player', () => {
    expect(expectedScore(1200, 1000)).toBeCloseTo(0.759746, 5);
    expect(expectedScore(1000, 1200)).toBeCloseTo(0.240253, 5);
  });
});

describe('updateElo', () => {
  it('updates ratings correctly when player A wins', () => {
    const { newA, newB } = updateElo(1200, 1000, 1);
    expect(newA).toBe(1208);
    expect(newB).toBe(992);
  });

  it('updates ratings correctly when player A loses', () => {
    const { newA, newB } = updateElo(1200, 1000, 0);
    expect(newA).toBe(1176);
    expect(newB).toBe(1024);
  });

  it('updates ratings correctly for a draw', () => {
    const { newA, newB } = updateElo(1200, 1000, 0.5);
    expect(newA).toBe(1192);
    expect(newB).toBe(1008);
  });

  it('respects non-default k factor', () => {
    const { newA, newB } = updateElo(1200, 1000, 1, 64);
    expect(newA).toBe(1215);
    expect(newB).toBe(985);
  });
});
