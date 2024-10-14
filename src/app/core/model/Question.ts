import { Answer } from "./Answer";
import { Quiz } from "./Quiz";

export class Question {
    id!: number;
    text!: string;
    fileName!: string;
    urlFile!: string;
    quiz = new Quiz();
    answers: Answer[] = [];
}