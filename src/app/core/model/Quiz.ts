import { Question } from "./Question";

export class Quiz {
    id!: number;
    title!: string;
    questions: Question[] = [];
}