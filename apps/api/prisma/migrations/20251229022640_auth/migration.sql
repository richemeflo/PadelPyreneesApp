-- DropForeignKey
ALTER TABLE "MatchProposal" DROP CONSTRAINT "MatchProposal_opponentPairId_fkey";

-- DropForeignKey
ALTER TABLE "MatchProposal" DROP CONSTRAINT "MatchProposal_requesterPairId_fkey";

-- DropForeignKey
ALTER TABLE "MatchProposalAcceptance" DROP CONSTRAINT "MatchProposalAcceptance_pairId_fkey";

-- DropForeignKey
ALTER TABLE "MatchReview" DROP CONSTRAINT "MatchReview_authorId_fkey";

-- DropForeignKey
ALTER TABLE "MatchReview" DROP CONSTRAINT "MatchReview_targetPairId_fkey";

-- DropForeignKey
ALTER TABLE "MatchScoreConfirmation" DROP CONSTRAINT "MatchScoreConfirmation_pairId_fkey";

-- DropForeignKey
ALTER TABLE "MatchScoreConfirmation" DROP CONSTRAINT "MatchScoreConfirmation_playerId_fkey";

-- DropForeignKey
ALTER TABLE "MatchScoreSubmission" DROP CONSTRAINT "MatchScoreSubmission_submittedBy_fkey";

-- DropForeignKey
ALTER TABLE "MatchScoreSubmission" DROP CONSTRAINT "MatchScoreSubmission_winnerPairId_fkey";

-- DropForeignKey
ALTER TABLE "MatchmakingAvailability" DROP CONSTRAINT "MatchmakingAvailability_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_userId_fkey";

-- DropForeignKey
ALTER TABLE "ReservationSuggestion" DROP CONSTRAINT "ReservationSuggestion_userId_fkey";

-- DropForeignKey
ALTER TABLE "TournamentRegistration" DROP CONSTRAINT "TournamentRegistration_playerId_fkey";

-- AddForeignKey
ALTER TABLE "MatchmakingAvailability" ADD CONSTRAINT "MatchmakingAvailability_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchProposal" ADD CONSTRAINT "MatchProposal_requesterPairId_fkey" FOREIGN KEY ("requesterPairId") REFERENCES "Pair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchProposal" ADD CONSTRAINT "MatchProposal_opponentPairId_fkey" FOREIGN KEY ("opponentPairId") REFERENCES "Pair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchProposalAcceptance" ADD CONSTRAINT "MatchProposalAcceptance_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "Pair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScoreSubmission" ADD CONSTRAINT "MatchScoreSubmission_winnerPairId_fkey" FOREIGN KEY ("winnerPairId") REFERENCES "Pair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScoreSubmission" ADD CONSTRAINT "MatchScoreSubmission_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScoreConfirmation" ADD CONSTRAINT "MatchScoreConfirmation_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScoreConfirmation" ADD CONSTRAINT "MatchScoreConfirmation_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "Pair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchReview" ADD CONSTRAINT "MatchReview_targetPairId_fkey" FOREIGN KEY ("targetPairId") REFERENCES "Pair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchReview" ADD CONSTRAINT "MatchReview_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentRegistration" ADD CONSTRAINT "TournamentRegistration_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationSuggestion" ADD CONSTRAINT "ReservationSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
