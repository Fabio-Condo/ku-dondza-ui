import { Answer } from "./Answer";
import { MathExpression } from "./MathExpression";
import { Subject } from "./Subject";
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
    fileName!: string;
    urlFile!: string;
    difficultyLevel!: string;
    topic = new Topic();
    answers: Answer[] = [];
    numberOfComments: number = 0;

    isAdminMenuOpen: boolean = false;
    showSolution: boolean = false;
    showTip: boolean = false;

    savedByUser: boolean = false;
    showLoadingSave: boolean = false;
}