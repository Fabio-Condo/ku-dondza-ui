export class ChallengeRankingResultDTO {
  userId!: number;
  username!: string;

  rankingPosition!: number;

  correctAnswers!: number;
  totalQuestions!: number;

  percentage!: number;

  timeSpent!: number; // segundos

  xpEarned!: number;

  quizId!: string;

}