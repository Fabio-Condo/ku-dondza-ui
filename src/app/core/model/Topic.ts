import { Question } from "./Question";
import { Subject } from "./Subject";

export class Topic {
    id!: number;
    name!: string;
    description!: string;
    subject = new Subject();
    questions: Question[] = [];

    selected: boolean = false; // Adicionamos uma propriedade para controle de seleção
    isAdminMenuOpen: boolean = false;
}