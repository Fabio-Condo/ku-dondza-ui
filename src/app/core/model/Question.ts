import { Answer } from "./Answer";
import { Subject } from "./Subject";
import { Topic } from "./Topic";

export class Question {
    id!: number;
    questionId!: string;
    text!: string;
    solution!: string;
    fileName!: string;
    urlFile!: string;
    topic = new Topic();
    answers: Answer[] = [];

    isAdminMenuOpen: boolean = false;
    showSolution: boolean = false;
}