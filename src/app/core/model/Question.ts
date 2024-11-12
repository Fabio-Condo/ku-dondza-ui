import { Answer } from "./Answer";
import { Subject } from "./Subject";

export class Question {
    id!: number;
    text!: string;
    fileName!: string;
    urlFile!: string;
    subject = new Subject();
    answers: Answer[] = [];

    isAdminMenuOpen: boolean = false;
}