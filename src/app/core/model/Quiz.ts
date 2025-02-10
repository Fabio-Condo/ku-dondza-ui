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
    difficultyLevel!: string;
    subject = new Subject();
    user = new User();
    selectedTopics: Topic[] = [];
    questions: Question[] = [];
    answers: Answer[] = [];

    totalQuestions: number = 0;
    isAdminMenuOpen: boolean = false;

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