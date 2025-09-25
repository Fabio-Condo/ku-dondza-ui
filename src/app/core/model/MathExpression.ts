import { Question } from "./Question";

export class MathExpression {
    id?: number;
    name?: string;
    expression?: string;
    question = new Question();

    constructor(id?: number, name?: string, expression?: string) {
        this.id = id;
        this.name = name;
        this.expression = expression;
    }
}
