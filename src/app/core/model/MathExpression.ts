import { Question } from "./Question";

export class MathExpression {
    id?: number;
    expression?: string;
    question = new Question();

    constructor(id?: number, expression?: string) {
        this.id = id;
        this.expression = expression;
    }
}
