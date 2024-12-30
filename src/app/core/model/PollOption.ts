import { User } from "./User";

export class PollOption {
    id?: number;
    text?: string;
    usersWhoVoted: User[] = [];
    voteCount?: number;

    selected: boolean = false;
    totalUsers: number = 0;

    constructor(id?: number, text?: string) {
        this.id = id;
        this.text = text;
    }
}