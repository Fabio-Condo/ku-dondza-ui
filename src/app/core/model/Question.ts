import { Answer } from "./Answer";
import { Subject } from "./Subject";
import { Topic } from "./Topic";

export class Question {
    id!: number;
    text!: string;
    fileName!: string;
    urlFile!: string;
    topic = new Topic();
    answers: Answer[] = [];

    isAdminMenuOpen: boolean = false;
}