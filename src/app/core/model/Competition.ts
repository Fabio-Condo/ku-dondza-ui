import { Question } from "./Question";
import { Subject } from "./Subject";
import { Submission } from "./Submission";
import { Topic } from "./Topic";
import { User } from "./User";

export class Competition {
    id!: number;
    competitionId!: string;
    title!: string;
    active!: false;
    expiry!: Date;
    difficultyLevel!: string;
    timeLimit!: number; // Tempo atribuído em segundos
    timeSpent!: number; // Tempo gasto em segundos
    limitPerTopic!: number;

    subject = new Subject();
    selectedTopics: Topic[] = [];

    topics: Topic[] = [];
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

    isAdminMenuOpen: boolean = false;
    totalTopics: number = 0;
    totalQuestions: number = 0;
    totalSubmissions: number = 0;
}