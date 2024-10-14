import { Question } from "./Question";

export class Answer {
    id!: number;
    text!: string;
    isCorrect: boolean = false;
    question = new Question();
}