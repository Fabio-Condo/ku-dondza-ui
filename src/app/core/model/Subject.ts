import { Topic } from "./Topic";

export class Subject {
    id!: number;
    name!: string;
    topics: Topic[] = [];

    isAdminMenuOpen: boolean = false;
}