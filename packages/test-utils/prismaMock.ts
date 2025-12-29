type ModelMock = {
  findUnique: jest.Mock;
  findMany: jest.Mock;
  findFirst: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  upsert: jest.Mock;
  delete: jest.Mock;
  count: jest.Mock;
};

export type PrismaMock = {
  player: ModelMock;
  club: ModelMock;
  court: ModelMock;
  pair: ModelMock;
  match: ModelMock;
  ratingHistory: ModelMock;
  matchmakingAvailability: ModelMock;
  matchProposal: ModelMock;
  matchProposalAcceptance: ModelMock;
  tournament: ModelMock;
  matchScoreSubmission: ModelMock;
  matchScoreConfirmation: ModelMock;
  matchReview: ModelMock;
  tournamentRegistration: ModelMock;
  reservation: ModelMock;
  reservationSuggestion: ModelMock;
  $transaction: jest.Mock;
  $queryRaw: jest.Mock;
  $connect: jest.Mock;
  $disconnect: jest.Mock;
  $on: jest.Mock;
  $use: jest.Mock;
};

const createModelMock = (): ModelMock => ({
  findUnique: jest.fn(),
  findMany: jest.fn(),
  findFirst: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  upsert: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
});

export function createPrismaMock(): PrismaMock {
  return {
    player: createModelMock(),
    club: createModelMock(),
    court: createModelMock(),
    pair: createModelMock(),
    match: createModelMock(),
    ratingHistory: createModelMock(),
    matchmakingAvailability: createModelMock(),
    matchProposal: createModelMock(),
    matchProposalAcceptance: createModelMock(),
    tournament: createModelMock(),
    matchScoreSubmission: createModelMock(),
    matchScoreConfirmation: createModelMock(),
    matchReview: createModelMock(),
    tournamentRegistration: createModelMock(),
    reservation: createModelMock(),
    reservationSuggestion: createModelMock(),
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $on: jest.fn(),
    $use: jest.fn(),
  };
}
