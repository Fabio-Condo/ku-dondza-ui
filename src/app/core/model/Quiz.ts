import { Answer } from "./Answer";
import { Question } from "./Question";
import { Subject } from "./Subject";
import { User } from "./User";

export class Quiz {
    id!: number;
    quizId!: string;
    title!: string;
    subject = new Subject();
    user = new User();
    questions: Question[] = []; // Inicializado como array vazio
    userSubmittedAnswers: Answer[] = [];
    
    totalQuestions: number = 0;
    isAdminMenuOpen: boolean = false;
}