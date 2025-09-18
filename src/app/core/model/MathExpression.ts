import { Question } from "./Question";

export class MathExpression {
    id?: number;
    expression?: string;
    name?: string = 'f(x)';
    question = new Question();

    constructor(id?: number, expression?: string) {
        this.id = id;
        this.expression = expression;
    }
}
