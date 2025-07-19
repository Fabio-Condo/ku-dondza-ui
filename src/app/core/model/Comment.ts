import { Question } from "./Question";
import { User } from "./User";

export class Comment {
    id!: number;
    content: string = '';
    createdAt!: Date;
    question = new Question();
    user = new User();
}