import { Answer } from "./Answer";
import { Competition } from "./Competition";
import { User } from "./User";

export class Submission {
    id!: number;
    submittedAt!: Date;
    timeSpent!: number; // Tempo gasto em segundos
    competition = new Competition();
    user = new User();
    answers: Answer[] = [];
    totalCorrectAnswers!: number;

    isAdminMenuOpen: boolean = false;
}