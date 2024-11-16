import { User } from "./User";

export class PostOption {
    id?: number;
    text?: string;
    peopleWhoSelected: User[] = [];

    selected: boolean = false;
    totalUsers: number = 0;

    constructor(id?: number, text?: string) {
        this.id = id;
        this.text = text;
    }
}