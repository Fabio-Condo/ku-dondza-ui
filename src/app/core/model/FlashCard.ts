import { Topic } from "./Topic";

export class FlashCard {
    id!: number;
    question!: string;
    answer!: string;
    category!: string;
    note!: string;
    status!: 'UNSEEN' | 'KNOWN' | 'LEARNING';
    saved: boolean = false;
    topic = new Topic();

    isAdminMenuOpen: boolean = false;
}