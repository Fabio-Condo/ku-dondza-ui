import { Topic } from "./Topic";

export class Subject {
    id!: number;
    name!: string;
    description!: string;
    category!: string; // "EXACT_SCIENCES" ou "HUMAN_SCIENCES" ou "LANGUAGES"
    subjectId!: string;

    quizEnabled: boolean = false;
    courseEnabled: boolean = false;
    progressEnabled: boolean = false;
    examEnabled: boolean = false;

    topics: Topic[] = [];
    
    totalTopics!: number;
    currentUserMarkedContentRate!: number;
    currentUserProgressRate!: number;

    //currentUserSubscribed: boolean = false;
    isAdminMenuOpen: boolean = false;
    showLoadingSubscription: boolean = false;
}