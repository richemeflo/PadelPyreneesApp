export function expectedScore(rA: number, rB: number) {
  return 1 / (1 + Math.pow(10, (rB - rA) / 400));
}
export function updateElo(rA: number, rB: number, scoreA: 0|0.5|1, k=32) {
  const expA = expectedScore(rA, rB);
  const newA = Math.round(rA + k * (scoreA - expA));
  const scoreB = 1 - scoreA;
  const expB = expectedScore(rB, rA);
  const newB = Math.round(rB + k * (scoreB - expB));
  return { newA, newB };
}
