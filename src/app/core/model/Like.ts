import { Article } from "./Article";
import { User } from "./User";

export class Like {
    id!: number;
    article!: Article;
    user!: User;
}