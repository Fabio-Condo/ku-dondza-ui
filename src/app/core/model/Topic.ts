import { Subject } from "./Subject";

export class Topic {
    id!: number;
    name!: string;
    content!: string;
    subject = new Subject();

    selected: boolean = false; // Adicionamos uma propriedade para controle de seleção
    isAdminMenuOpen: boolean = false;
}