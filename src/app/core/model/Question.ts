import { Answer } from "./Answer";
import { Quiz } from "./Quiz";

export class Question {
    id!: number;
    text!: string;
    quiz = new Quiz();
    answers: Answer[] = [];
}