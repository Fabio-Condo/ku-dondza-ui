import { Tema } from "./Tema";

export class OnlineCourseContent {
    id!: number;
    description!: string;
    fileName!: string;
    urlFile!: string;
    contentType!: string;
    tema = new Tema();
    position!: number;
    
    showLoadingDownload: boolean = false;
    isAdminMenuOpen: boolean = false;

}