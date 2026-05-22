import { Subject } from "./Subject";

export class Challenge {

  id!: number;
  challengeId!: string;

  title!: string;
  description?: string;

  difficultyLevel!: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  subject = new Subject();

  xpReward!: number;

  startDate!: Date;
  endDate!: Date;

  subjectName?: string;

  status!: 'UPCOMING' | 'ONGOING' | 'DONE';

  totalQuestions!: number;

  remainingHours?: number;

  hasCurrentUserSubmitted!: boolean;

  totalParticipants!: number;

  isAdminMenuOpen: boolean = false;
}