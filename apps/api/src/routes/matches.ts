import type { MatchScoreConfirmation, Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { updateElo } from "../services/elo";
import { authGuard, requireFirebaseUser } from "../middlewares/authGuard";

export const matchesRouter = Router();

const createMatchSchema = z.object({
  pairAId: z.string(),
  pairBId: z.string(),
  startsAt: z.coerce.date(),
  courtId: z.string().optional(),
});

const scoreSubmissionSchema = z.object({
  winnerPairId: z.string(),
  score: z.string().min(1),
});

const scoreConfirmationSchema = z.object({
  accept: z.boolean().default(true),
});

const reviewSchema = z.object({
  targetPairId: z.string(),
  fairPlay: z.number().int().min(1).max(5),
  skill: z.number().int().min(1).max(5),
  rematchInterest: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

type MatchWithPairs = Prisma.MatchGetPayload<{
  include: {
    pairA: { include: { l: true; r: true } };
    pairB: { include: { l: true; r: true } };
  };
}>;

type PendingScoreResponse = {
  id: string;
  score: string;
  winnerPairId: string;
  submittedBy: string;
  confirmedPairs: string[];
  confirmedByPlayers: string[];
  createdAt: Date;
};

type SubmissionWithConfirmations = Prisma.MatchScoreSubmissionGetPayload<{
  include: { confirmations: true };
}>;

function buildPendingScore(submission: SubmissionWithConfirmations): PendingScoreResponse {
  const confirmedByPlayers = submission.confirmations.map((confirmation) => confirmation.playerId);
  const confirmedPairs = Array.from(
    new Set(submission.confirmations.map((confirmation) => confirmation.pairId)),
  );
  return {
    id: submission.id,
    score: submission.score,
    winnerPairId: submission.winnerPairId,
    submittedBy: submission.submittedBy,
    confirmedPairs,
    confirmedByPlayers,
    createdAt: submission.createdAt,
  };
}

matchesRouter.post("/", authGuard, async (req, res, next) => {
  try {
    const payload = createMatchSchema.parse(req.body);
    const auth = requireFirebaseUser(req);
    if (payload.pairAId === payload.pairBId) {
      res.status(400).json({ error: "pairAId and pairBId must differ" });
      return;
    }

    const [pairA, pairB] = await Promise.all([
      prisma.pair.findUnique({ where: { id: payload.pairAId }, include: { l: true, r: true } }),
      prisma.pair.findUnique({ where: { id: payload.pairBId }, include: { l: true, r: true } }),
    ]);

    if (!pairA || !pairB) {
      res.status(404).json({ error: "Pair not found" });
      return;
    }

    const participantIds = [pairA.l.id, pairA.r.id, pairB.l.id, pairB.r.id];
    if (!participantIds.includes(auth.uid)) {
      res.status(403).json({ error: "Player must belong to one of the pairs" });
      return;
    }

    const match = await prisma.match.create({
      data: {
        pairAId: payload.pairAId,
        pairBId: payload.pairBId,
        startsAt: payload.startsAt,
        courtId: payload.courtId,
        status: "PENDING",
      },
    });

    res.status(201).json(match);
  } catch (error) {
    next(error);
  }
});

matchesRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const [match, submission, reviews] = await Promise.all([
      prisma.match.findUnique({
        where: { id },
        include: {
          pairA: { include: { l: true, r: true } },
          pairB: { include: { l: true, r: true } },
          ratingHistory: {
            include: { player: { select: { id: true, pseudo: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.matchScoreSubmission.findUnique({
        where: { matchId: id },
        include: { confirmations: true },
      }),
      prisma.matchReview.findMany({
        where: { matchId: id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (!match) {
      res.status(404).json({ error: "Match not found" });
      return;
    }

    res.json({
      match,
      pendingScore: submission ? buildPendingScore(submission) : null,
      reviews,
    });
  } catch (error) {
    next(error);
  }
});

matchesRouter.post("/:id/submit-score", authGuard, async (req, res, next) => {
  try {
    const params = z.object({ id: z.string() }).parse(req.params);
    const payload = scoreSubmissionSchema.parse(req.body);
    const auth = requireFirebaseUser(req);

    const match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        pairA: { include: { l: true, r: true } },
        pairB: { include: { l: true, r: true } },
      },
    });

    if (!match) {
      res.status(404).json({ error: "Match not found" });
      return;
    }

    const participantPairId = findParticipantPair(match, auth.uid);
    if (!participantPairId) {
      res.status(403).json({ error: "Player is not part of this match" });
      return;
    }

    if (match.status === "CONFIRMED") {
      res.status(409).json({ error: "Match already confirmed" });
      return;
    }

    if (match.status === "DISPUTED") {
      res.status(409).json({ error: "Match is disputed" });
      return;
    }

    if (![match.pairAId, match.pairBId].includes(payload.winnerPairId)) {
      res.status(400).json({ error: "Winner pair must be part of the match" });
      return;
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.matchScoreSubmission.create({
          data: {
            matchId: params.id,
            score: payload.score,
            winnerPairId: payload.winnerPairId,
            submittedBy: auth.uid,
          },
        });

        await tx.match.update({
          where: { id: params.id },
          data: { status: "AWAITING_CONFIRMATION" },
        });
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        res.status(409).json({ error: "Score already submitted" });
        return;
      }
      throw error;
    }

    res.json({ status: "waiting", matchId: params.id });
  } catch (error) {
    next(error);
  }
});

matchesRouter.post("/:id/confirm-score", authGuard, async (req, res, next) => {
  try {
    const params = z.object({ id: z.string() }).parse(req.params);
    const payload = scoreConfirmationSchema.parse(req.body);
    const auth = requireFirebaseUser(req);

    const match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        pairA: { include: { l: true, r: true } },
        pairB: { include: { l: true, r: true } },
      },
    });

    if (!match) {
      res.status(404).json({ error: "Match not found" });
      return;
    }

    if (match.status === "CONFIRMED") {
      res.status(409).json({ error: "Match already confirmed" });
      return;
    }

    if (match.status === "DISPUTED") {
      res.status(409).json({ error: "Match is disputed" });
      return;
    }

    if (match.status !== "AWAITING_CONFIRMATION") {
      res.status(409).json({ error: "Match is not awaiting confirmation" });
      return;
    }

    const submission = await prisma.matchScoreSubmission.findUnique({
      where: { matchId: params.id },
      include: { confirmations: true },
    });
    if (!submission) {
      res.status(404).json({ error: "No pending score for this match" });
      return;
    }

    const participantPairId = findParticipantPair(match, auth.uid);
    if (!participantPairId) {
      res.status(403).json({ error: "Player is not part of this match" });
      return;
    }

    if (!payload.accept) {
      await prisma.$transaction(async (tx) => {
        await tx.match.update({
          where: { id: params.id },
          data: { status: "DISPUTED" },
        });
        await tx.matchScoreConfirmation.deleteMany({
          where: { submissionId: submission.id },
        });
        await tx.matchScoreSubmission.delete({
          where: { id: submission.id },
        });
      });
      res.json({ status: "disputed", matchId: params.id });
      return;
    }

    const alreadyConfirmed = submission.confirmations.some(
      (confirmation) => confirmation.playerId === auth.uid,
    );
    if (alreadyConfirmed) {
      const pendingScore = buildPendingScore(submission);
      res.json({
        status: "waiting",
        message: "Player already confirmed",
        confirmedPairs: pendingScore.confirmedPairs,
      });
      return;
    }

    let confirmationRecord: MatchScoreConfirmation;
    try {
      confirmationRecord = await prisma.matchScoreConfirmation.create({
        data: {
          submissionId: submission.id,
          playerId: auth.uid,
          pairId: participantPairId,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        const pendingScore = buildPendingScore(submission);
        res.json({
          status: "waiting",
          message: "Player already confirmed",
          confirmedPairs: pendingScore.confirmedPairs,
        });
        return;
      }
      throw error;
    }

    const confirmations = [...submission.confirmations, confirmationRecord];
    const confirmedPairs = new Set(confirmations.map((entry) => entry.pairId));

    if (confirmedPairs.size >= 2) {
      const result = await finalizeMatch(params.id, submission);
      res.json({ status: "confirmed", match: result });
      return;
    }

    res.json({
      status: "waiting",
      confirmedPairs: Array.from(confirmedPairs),
    });
  } catch (error) {
    next(error);
  }
});

matchesRouter.post("/:id/review", authGuard, async (req, res, next) => {
  try {
    const params = z.object({ id: z.string() }).parse(req.params);
    const payload = reviewSchema.parse(req.body);
    const auth = requireFirebaseUser(req);

    const match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        pairA: { include: { l: true, r: true } },
        pairB: { include: { l: true, r: true } },
      },
    });
    if (!match) {
      res.status(404).json({ error: "Match not found" });
      return;
    }

    const participantPairId = findParticipantPair(match, auth.uid);
    if (!participantPairId) {
      res.status(403).json({ error: "Player is not part of this match" });
      return;
    }

    await prisma.matchReview.create({
      data: {
        matchId: params.id,
        targetPairId: payload.targetPairId,
        authorId: auth.uid,
        fairPlay: payload.fairPlay,
        skill: payload.skill,
        rematchInterest: payload.rematchInterest,
        comment: payload.comment,
      },
    });

    res.status(201).json({ status: "recorded" });
  } catch (error) {
    next(error);
  }
});

async function finalizeMatch(matchId: string, submission: SubmissionWithConfirmations) {
  return prisma.$transaction(async (tx) => {
    await tx.match.update({
      where: { id: matchId },
      data: {
        status: "CONFIRMED",
        score: submission.score,
      },
      include: {
        pairA: { include: { l: true, r: true } },
        pairB: { include: { l: true, r: true } },
      },
    });

    await tx.matchScoreConfirmation.deleteMany({
      where: { submissionId: submission.id },
    });
    await tx.matchScoreSubmission.deleteMany({
      where: { id: submission.id },
    });

    const matchWithPairs = await tx.match.findUnique({
      where: { id: matchId },
      include: {
        pairA: { include: { l: true, r: true } },
        pairB: { include: { l: true, r: true } },
      },
    });

    if (!matchWithPairs) {
      throw new Error("Match disappeared during confirmation");
    }

    await applyEloUpdate(tx, matchWithPairs, submission.winnerPairId);

    const refreshed = await tx.match.findUnique({
      where: { id: matchId },
      include: {
        pairA: { include: { l: true, r: true } },
        pairB: { include: { l: true, r: true } },
      },
    });

    if (!refreshed) {
      throw new Error("Unable to load match after Elo update");
    }

    return refreshed;
  });
}

async function applyEloUpdate(tx: Prisma.TransactionClient, match: MatchWithPairs, winnerPairId: string) {
  if (![match.pairAId, match.pairBId].includes(winnerPairId)) {
    throw new Error("Winner pair does not belong to match");
  }

  const scoreA = winnerPairId === match.pairAId ? 1 : 0;
  const { newA: newPairAElo, newB: newPairBElo } = updateElo(match.pairA.elo, match.pairB.elo, scoreA);

  const deltaA = newPairAElo - match.pairA.elo;
  const deltaB = newPairBElo - match.pairB.elo;

  await tx.pair.update({ where: { id: match.pairAId }, data: { elo: newPairAElo } });
  await tx.pair.update({ where: { id: match.pairBId }, data: { elo: newPairBElo } });

  const playerUpdates = [
    { player: match.pairA.l, delta: deltaA },
    { player: match.pairA.r, delta: deltaA },
    { player: match.pairB.l, delta: deltaB },
    { player: match.pairB.r, delta: deltaB },
  ];

  for (const { player, delta } of playerUpdates) {
    const before = player.elo;
    const after = Math.max(0, before + delta);
    await tx.player.update({ where: { id: player.id }, data: { elo: after } });
    await tx.ratingHistory.create({
      data: {
        playerId: player.id,
        matchId: match.id,
        before,
        after,
        delta: after - before,
      },
    });
  }
}

function findParticipantPair(match: MatchWithPairs, playerId: string) {
  if (match.pairA.l.id === playerId || match.pairA.r.id === playerId) return match.pairAId;
  if (match.pairB.l.id === playerId || match.pairB.r.id === playerId) return match.pairBId;
  return null;
}

function isUniqueConstraintError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    (error as Prisma.PrismaClientKnownRequestError).code === "P2002"
  );
}
