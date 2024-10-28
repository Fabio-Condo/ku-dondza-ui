import { Quiz } from "./Quiz";
import { User } from "./User";

export class Competition {
    id!: number;
    title!: string;
    participants: User[] = [];
    quiz = new Quiz();
}