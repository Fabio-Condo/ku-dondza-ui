import { Subject } from "./Subject";

export class Topic {
    id!: number;
    name!: string;
    subject = new Subject();

    selected: boolean = false; // Adicionamos uma propriedade para controle de seleção
}