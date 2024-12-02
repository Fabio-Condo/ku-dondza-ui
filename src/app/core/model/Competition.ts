import { Question } from "./Question";
import { Quiz } from "./Quiz";
import { User } from "./User";

export class Competition {
    id!: number;
    title!: string;
    participants: User[] = [];
    participationRequests: User[] = [];
    questions: Question[] = [];

    totalParticipants: number = 0;
    totalQuestions: number = 0;

    requestedParticipation: boolean = false;
    isParticipant: boolean = false;

    isAdminMenuOpen: boolean = false;
}