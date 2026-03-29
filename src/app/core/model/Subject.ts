import { Topic } from "./Topic";

export class Subject {
    id!: number;
    name!: string;
    description!: string;
    category!: string; // "EXACT_SCIENCES" ou "HUMAN_SCIENCES" ou "LANGUAGES"
    subjectId!: string;
    topics: Topic[] = [];
    totalTopics!: number;
    currentUserMarkedContentRate!: number;
    currentUserProgressRate!: number;

    //currentUserSubscribed: boolean = false;
    isAdminMenuOpen: boolean = false;
    showLoadingSubscription: boolean = false;
}