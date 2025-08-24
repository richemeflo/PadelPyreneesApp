interface EloChartProps {
  history: { date: string; elo: number }[];
}

export function EloChart({ history }: EloChartProps) {
  if (history.length === 0) return null;

  const max = Math.max(...history.map((p) => p.elo));
  const min = Math.min(...history.map((p) => p.elo));
  const range = max - min || 1;
  const points = history
    .map((p, i) => {
      const x = (i / (history.length - 1)) * 100;
      const y = 100 - ((p.elo - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-24">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="text-primary"
      />
    </svg>
  );
}
