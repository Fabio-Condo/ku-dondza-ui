import { Question } from "./Question";
import { Subject } from "./Subject";

export class Quiz {
    id!: number;
    quizId!: string;
    title!: string;
    subject = new Subject();
    questions: Question[] = [];

    totalQuestions: number = 0;
    isAdminMenuOpen: boolean = false;

}