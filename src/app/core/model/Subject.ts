import { Topic } from "./Topic";

export class Subject {
    id!: number;
    name!: string;
    description!: string;
    subjectId!: string;
    topics: Topic[] = [];
    currentUserMarkedContentRate!: number;

    currentUserSubscribed: boolean = false;
    isAdminMenuOpen: boolean = false;
    showLoadingSubscription: boolean = false;
}