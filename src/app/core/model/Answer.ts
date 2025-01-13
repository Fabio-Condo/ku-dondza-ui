import { Question } from "./Question";

export class Answer {
    id?: number;
    text?: string;
    correct?: boolean;
    question = new Question();

    constructor(id?: number, text?: string, correct?: boolean) {
        this.id = id;
        this.text = text;
        this.correct = correct;
    }
}
