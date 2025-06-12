import { Prize } from "./Prize";
import { Question } from "./Question";
import { Subject } from "./Subject";
import { Submission } from "./Submission";
import { Topic } from "./Topic";
import { User } from "./User";

export class Competition {
    id!: number;
    competitionId!: string;
    competitionType!: string;
    active!: false;
    expiry!: Date;
    open!: false;
    difficultyLevel!: string;
    currentUserAllowedToSubmit!: boolean;
    currentUserHasSubmitted!: boolean; // Indica se o usuário atual já enviou uma submissão
    timeLimit!: number; // Tempo atribuído em segundos
    limitPerTopic!: number;

    subject = new Subject();
    selectedTopics: Topic[] = [];

    topics: Topic[] = [];
    questions: Question[] = [];
    submissions: Submission[] = [];
    prizes: Prize[] = [];

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