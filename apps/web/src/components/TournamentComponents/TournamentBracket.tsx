import { Card, CardContent } from '../ui/card';

interface BracketMatch {
  teams: [string, string];
  score: [number, number];
}

interface BracketRound {
  name: string;
  matches: BracketMatch[];
}

interface Bracket {
  rounds: BracketRound[];
}

interface TournamentBracketProps {
  bracket: Bracket;
}

export function TournamentBracket({ bracket }: TournamentBracketProps) {
  return (
    <div className="space-y-4">
      {bracket.rounds.map((round, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold">{round.name}</h3>
            {round.matches.map((match, j) => (
              <div key={j} className="flex justify-between text-sm">
                <span>
                  {match.teams[0]} vs {match.teams[1]}
                </span>
                <span>
                  {match.score[0]}-{match.score[1]}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
