import request from "supertest";

import { app } from "../../app";
import { updateElo } from "../../services/elo";
import { mockVerifyIdToken } from "../../test-utils/firebase";
import { prismaMock } from "../../test-utils/prisma";

const authHeader = "Bearer test-token";

const createMatchFixture = () => {
  const playerA1 = { id: "player-a1", elo: 1200 };
  const playerA2 = { id: "player-a2", elo: 1180 };
  const playerB1 = { id: "player-b1", elo: 1100 };
  const playerB2 = { id: "player-b2", elo: 1120 };

  const pairA = { id: "pair-a", elo: 1190, l: playerA1, r: playerA2 };
  const pairB = { id: "pair-b", elo: 1110, l: playerB1, r: playerB2 };

  const match = {
    id: "match-1",
    pairAId: pairA.id,
    pairBId: pairB.id,
    pairA,
    pairB,
    courtId: null,
    startsAt: new Date("2025-02-01T10:00:00Z"),
    score: null,
    status: "PENDING",
    createdAt: new Date("2025-02-01T09:00:00Z"),
  };

  return {
    playerA1,
    playerA2,
    playerB1,
    playerB2,
    pairA,
    pairB,
    match,
  };
};

describe("matches routes", () => {
  it("creates a match for a participant", async () => {
    const { pairA, pairB, match } = createMatchFixture();

    mockVerifyIdToken.mockResolvedValue({
      uid: pairA.l.id,
      email: "player-a1@test.com",
    });
    prismaMock.pair.findUnique.mockResolvedValueOnce(pairA).mockResolvedValueOnce(pairB);
    prismaMock.match.create.mockResolvedValue(match);

    const response = await request(app)
      .post("/matches")
      .set("Authorization", authHeader)
      .send({
        pairAId: pairA.id,
        pairBId: pairB.id,
        startsAt: "2025-02-01T10:00:00Z",
        courtId: "court-1",
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: match.id,
      pairAId: pairA.id,
      pairBId: pairB.id,
      status: "PENDING",
    });
    expect(prismaMock.match.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        pairAId: pairA.id,
        pairBId: pairB.id,
        courtId: "court-1",
        status: "PENDING",
        startsAt: new Date("2025-02-01T10:00:00Z"),
      }),
    });
  });

  it("submits a score and moves the match to awaiting confirmation", async () => {
    const { pairA, match, playerA1 } = createMatchFixture();

    mockVerifyIdToken.mockResolvedValue({
      uid: playerA1.id,
      email: "player-a1@test.com",
    });
    prismaMock.match.findUnique.mockResolvedValue(match);

    const tx = {
      matchScoreSubmission: { create: jest.fn().mockResolvedValue({}) },
      match: { update: jest.fn().mockResolvedValue({}) },
    };
    prismaMock.$transaction.mockImplementation(async (handler) => handler(tx));

    const response = await request(app)
      .post(`/matches/${match.id}/submit-score`)
      .set("Authorization", authHeader)
      .send({ winnerPairId: pairA.id, score: "6-4 6-4" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "waiting", matchId: match.id });
    expect(tx.matchScoreSubmission.create).toHaveBeenCalledWith({
      data: {
        matchId: match.id,
        score: "6-4 6-4",
        winnerPairId: pairA.id,
        submittedBy: playerA1.id,
      },
    });
    expect(tx.match.update).toHaveBeenCalledWith({
      where: { id: match.id },
      data: { status: "AWAITING_CONFIRMATION" },
    });
  });

  it("disputes a match when a score is rejected", async () => {
    const { pairA, match, playerA1 } = createMatchFixture();

    mockVerifyIdToken.mockResolvedValue({
      uid: playerA1.id,
      email: "player-a1@test.com",
    });
    prismaMock.match.findUnique.mockResolvedValue({ ...match, status: "AWAITING_CONFIRMATION" });
    const submission = {
      id: "submission-1",
      matchId: match.id,
      winnerPairId: pairA.id,
      score: "6-4 6-4",
      submittedBy: playerA1.id,
      confirmations: [],
      createdAt: new Date("2025-02-01T10:30:00Z"),
    };
    prismaMock.matchScoreSubmission.findUnique.mockResolvedValue(submission);

    const tx = {
      match: { update: jest.fn().mockResolvedValue({}) },
      matchScoreConfirmation: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
      matchScoreSubmission: { delete: jest.fn().mockResolvedValue({}) },
    };
    prismaMock.$transaction.mockImplementation(async (handler) => handler(tx));

    const response = await request(app)
      .post(`/matches/${match.id}/confirm-score`)
      .set("Authorization", authHeader)
      .send({ accept: false });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "disputed", matchId: match.id });
    expect(tx.match.update).toHaveBeenCalledWith({
      where: { id: match.id },
      data: { status: "DISPUTED" },
    });
    expect(tx.matchScoreConfirmation.deleteMany).toHaveBeenCalledWith({
      where: { submissionId: submission.id },
    });
    expect(tx.matchScoreSubmission.delete).toHaveBeenCalledWith({
      where: { id: submission.id },
    });
  });

  it("confirms a score and applies elo updates after the second confirmation", async () => {
    const { pairA, pairB, match, playerA1, playerB1 } = createMatchFixture();

    mockVerifyIdToken.mockResolvedValue({
      uid: playerB1.id,
      email: "player-b1@test.com",
    });
    prismaMock.match.findUnique.mockResolvedValue({ ...match, status: "AWAITING_CONFIRMATION" });
    const submission = {
      id: "submission-1",
      matchId: match.id,
      winnerPairId: pairA.id,
      score: "6-4 6-4",
      submittedBy: playerA1.id,
      confirmations: [
        {
          id: "confirmation-a",
          submissionId: "submission-1",
          playerId: playerA1.id,
          pairId: pairA.id,
          acceptedAt: new Date("2025-02-01T11:00:00Z"),
        },
      ],
      createdAt: new Date("2025-02-01T10:30:00Z"),
    };
    prismaMock.matchScoreSubmission.findUnique.mockResolvedValue(submission);
    prismaMock.matchScoreConfirmation.create.mockResolvedValue({
      id: "confirmation-b",
      submissionId: submission.id,
      playerId: playerB1.id,
      pairId: pairB.id,
      acceptedAt: new Date("2025-02-01T11:05:00Z"),
    });

    const tx = {
      match: {
        update: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
      },
      matchScoreConfirmation: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
      matchScoreSubmission: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
      pair: { update: jest.fn().mockResolvedValue({}) },
      player: { update: jest.fn().mockResolvedValue({}) },
      ratingHistory: { create: jest.fn().mockResolvedValue({}) },
    };
    const matchWithPairs = { ...match, status: "AWAITING_CONFIRMATION", pairA, pairB };
    tx.match.findUnique.mockResolvedValueOnce(matchWithPairs).mockResolvedValueOnce(matchWithPairs);
    prismaMock.$transaction.mockImplementation(async (handler) => handler(tx));

    const response = await request(app)
      .post(`/matches/${match.id}/confirm-score`)
      .set("Authorization", authHeader)
      .send({ accept: true });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("confirmed");
    expect(prismaMock.matchScoreConfirmation.create).toHaveBeenCalledWith({
      data: {
        submissionId: submission.id,
        playerId: playerB1.id,
        pairId: pairB.id,
      },
    });
    expect(tx.match.update).toHaveBeenCalledWith({
      where: { id: match.id },
      data: { status: "CONFIRMED", score: submission.score },
      include: expect.any(Object),
    });

    const { newA, newB } = updateElo(pairA.elo, pairB.elo, 1);
    const deltaA = newA - pairA.elo;
    const deltaB = newB - pairB.elo;
    const expectedPlayerA1 = Math.max(0, playerA1.elo + deltaA);
    const expectedPlayerB1 = Math.max(0, playerB1.elo + deltaB);

    expect(tx.pair.update).toHaveBeenCalledWith({
      where: { id: pairA.id },
      data: { elo: newA },
    });
    expect(tx.pair.update).toHaveBeenCalledWith({
      where: { id: pairB.id },
      data: { elo: newB },
    });
    expect(tx.player.update).toHaveBeenCalledWith({
      where: { id: playerA1.id },
      data: { elo: expectedPlayerA1 },
    });
    expect(tx.player.update).toHaveBeenCalledWith({
      where: { id: playerB1.id },
      data: { elo: expectedPlayerB1 },
    });
    expect(tx.ratingHistory.create).toHaveBeenCalledTimes(4);
  });

  it("creates a review for a match participant", async () => {
    const { pairB, match, playerA1 } = createMatchFixture();

    mockVerifyIdToken.mockResolvedValue({
      uid: playerA1.id,
      email: "player-a1@test.com",
    });
    prismaMock.match.findUnique.mockResolvedValue(match);
    prismaMock.matchReview.create.mockResolvedValue({ id: "review-1" });

    const response = await request(app)
      .post(`/matches/${match.id}/review`)
      .set("Authorization", authHeader)
      .send({
        targetPairId: pairB.id,
        fairPlay: 5,
        skill: 4,
        rematchInterest: 3,
        comment: "Great match",
      });

    expect(response.status).toBe(201);
    expect(prismaMock.matchReview.create).toHaveBeenCalledWith({
      data: {
        matchId: match.id,
        targetPairId: pairB.id,
        authorId: playerA1.id,
        fairPlay: 5,
        skill: 4,
        rematchInterest: 3,
        comment: "Great match",
      },
    });
  });
});
