import { Question } from "./Question";
import { Subject } from "./Subject";
import { Test } from "./Test";
import { TopicContent } from "./Topic-content";

export class Topic {
    id!: number;
    topicId!: string;
    name!: string;
    description!: string;
    subject = new Subject();
    totalQuestions!: number;
    questions: Question[] = [];
    contents: TopicContent[] = [];
    tests: Test[] = [];
    premium: boolean = false;

    selected: boolean = false; // Adicionamos uma propriedade para controle de seleção
    isAdminMenuOpen: boolean = false;
}