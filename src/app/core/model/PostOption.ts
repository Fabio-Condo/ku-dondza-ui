import { User } from "./User";

export class PostOption {
    id?: number;
    text?: string;
    peopleWhoSelected: User[] = [];

    constructor(id?: number, text?: string) {
        this.id = id;
        this.text = text;
    }
}