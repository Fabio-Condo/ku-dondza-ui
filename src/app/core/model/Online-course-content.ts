import { Tema } from "./Tema";

export class OnlineCourseContent {
    id!: number;
    description!: string;
    fileName!: string;
    urlFile!: string;
    contentType!: string;
    tema = new Tema();

    showLoadingDownload: boolean = false;
    isAdminMenuOpen: boolean = false;

}