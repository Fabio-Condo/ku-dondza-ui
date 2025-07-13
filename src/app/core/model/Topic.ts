import { Question } from "./Question";
import { Subject } from "./Subject";
import { TopicContent } from "./Topic-content";

export class Topic {
    id!: number;
    topicId!: string;
    name!: string;
    description!: string;
    subject = new Subject();
    questions: Question[] = [];
    contents: TopicContent[] = [];

    selected: boolean = false; // Adicionamos uma propriedade para controle de seleção
    isAdminMenuOpen: boolean = false;
}