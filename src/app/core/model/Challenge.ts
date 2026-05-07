export class Challenge {

  id!: number;
  challengeId!: string;

  title!: string;
  description?: string;

  difficultyLevel!: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  xpReward!: number;

  startDate!: Date;
  endDate!: Date;

  subjectName?: string;

  status!: 'UPCOMING' | 'ONGOING' | 'DONE';

  totalQuestions!: number;

  remainingHours?: number;

  submitted!: boolean;

  totalParticipants!: number;
}