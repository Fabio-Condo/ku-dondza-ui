import { Answer } from "./Answer";
import { MathExpression } from "./MathExpression";
import { Topic } from "./Topic";

export class Question {
    id!: number;
    questionId!: string;
    text!: string;
    timeLimit!: number; // Tempo em segundos
    timeRemaining!: number;
    mathExpressions: MathExpression[] = []; // Alterado para uma lista de expressões
    tip!: string;
    solution!: string;
    difficultyLevel!: string; // "BEGINNER", "ADVANCED"
    validated: boolean = false;
    fileName!: string;
    urlFile!: string;
    highlighted!: boolean;
    topic = new Topic();
    answers: Answer[] = [];
    numberOfComments: number = 0;
    selected: boolean = false;

    isAdminMenuOpen: boolean = false;
    showSolution: boolean = false;
    showTip: boolean = false;

    verified: boolean = false; // Indica se o user verificou a questão, para mostrar a dica ou solução automaticamente
    savedByUser: boolean = false;
    showLoadingSave: boolean = false;
    showLoadingValidation: boolean = false;
}