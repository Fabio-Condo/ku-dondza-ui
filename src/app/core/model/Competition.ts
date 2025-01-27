import { Question } from "./Question";
import { Submission } from "./Submission";
import { User } from "./User";

export class Competition {
    id!: number;
    competitionId!: string;
    title!: string;
    startedAt!: Date;
    participants: User[] = [];
    administrators: User[] = [];
    participationRequests: User[] = [];
    questions: Question[] = [];
    submissions: Submission[] = [];

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