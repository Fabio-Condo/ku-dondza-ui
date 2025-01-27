import { Answer } from "./Answer";
import { Competition } from "./Competition";
import { User } from "./User";

export class Submission {
    id!: number;
    submittedAt!: Date;
    competition = new Competition();
    user = new User();
    userSubmittedAnswers: Answer[] = [];

    isAdminMenuOpen: boolean = false;
}