import { CompetitionWinner } from "./CompetitionWinner";
import { Prize } from "./Prize";
import { Question } from "./Question";
import { Subject } from "./Subject";
import { Submission } from "./Submission";
import { Topic } from "./Topic";
import { User } from "./User";

export class Competition {
    id!: number;
    competitionId!: string;
    title!: string;
    status!: string;  // PLANNING, ONGOING, FINISHED, CANCELED
    startedAt!: Date;
    difficultyLevel!: string;

    participants: User[] = [];
    administrators: User[] = [];
    participationRequests: User[] = [];

    subject = new Subject();
    selectedTopics: Topic[] = [];
    
    questions: Question[] = [];
    submissions: Submission[] = [];
    prizes: Prize[] = [];
    winners: CompetitionWinner[] = [];

    // Adicionando a propriedade resultsByTopic
    resultsByTopic: {
        [key: string]: {
            correct: number;
            incorrect: number;
            nullAnswers: number;
            total: number;
            percentage?: number; // Propriedade opcional
        }
    } = {};

    totalParticipants: number = 0;
    totalQuestions: number = 0;

    requestedParticipation: boolean = false;
    isParticipant: boolean = false;
    isAdminMenuOpen: boolean = false;
}