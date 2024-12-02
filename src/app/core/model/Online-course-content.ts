import { Tema } from "./Tema";

export class OnlineCourseContent {
    id!: number;
    description!: string;
    fileName!: string;
    urlFile!: string;
    tema = new Tema();

    isAdminMenuOpen: boolean = false;

}