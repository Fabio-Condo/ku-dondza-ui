import { Answer } from "./Answer";
import { Question } from "./Question";
import { Subject } from "./Subject";
import { Topic } from "./Topic";
import { User } from "./User";

export class Quiz {
    id!: number;
    quizId!: string;
    title!: string;
    submittedAt!: Date;
    timeLimit!: number; // Tempo atribuído em segundos
    timeSpent!: number; // Tempo gasto em segundos
    limitPerTopic!: number;
    anonymous: any; // Define se o quiz é anônimo
    type!: string; // "TRAINING" ou "TEST"
    difficultyLevel!: string; // "BEGINNER", "ADVANCED"
    subject = new Subject();
    user = new User();
    topics: Topic[] = [];
    questions: Question[] = [];
    answers: Answer[] = [];

    accuracyRate: number = 0;
    totalQuestions: number = 0;
    isAdminMenuOpen: boolean = false;
    showLoadingSave: boolean = false;

    isSubmitted: boolean = false;

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
}